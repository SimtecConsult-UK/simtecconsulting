import type { BlogBlock, Run } from "./types";

/**
 * Converting between the writing surface and the stored article.
 *
 * The editor is a `contentEditable`, so what comes out of it is browser HTML —
 * inconsistent between browsers, and full of whatever a paste dragged in. None
 * of that is stored. `htmlToBlocks` walks the DOM and keeps only the handful of
 * shapes the article page can render, dropping everything else, so the database
 * holds a small known structure rather than markup the site would have to
 * sanitise before displaying.
 *
 * These run in the browser: they use the DOM directly rather than shipping a
 * parser.
 */

/** Inline marks the toolbar offers. Everything else is flattened to plain text. */
function runsFrom(node: Node, inherited: Omit<Run, "t"> = {}): Run[] {
  const runs: Run[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? "";
      if (text) runs.push({ ...inherited, t: text });
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const element = child as HTMLElement;
    const marks = { ...inherited };

    switch (element.tagName) {
      case "STRONG":
      case "B":
        marks.b = true;
        break;
      case "EM":
      case "I":
        marks.i = true;
        break;
      case "A": {
        const href = element.getAttribute("href") ?? "";
        // Only http(s) and mailto survive: a `javascript:` href pasted in would
        // otherwise be stored and later rendered as a link.
        if (/^(https?:|mailto:)/i.test(href)) marks.href = href;
        break;
      }
      case "BR":
        runs.push({ ...inherited, t: " " });
        continue;
    }

    runs.push(...runsFrom(element, marks));
  }

  // Merge neighbours carrying the same marks, so a browser's stray split does
  // not become two runs in the database.
  return runs.reduce<Run[]>((merged, run) => {
    const last = merged[merged.length - 1];
    if (last && last.b === run.b && last.i === run.i && last.href === run.href) {
      last.t += run.t;
      return merged;
    }
    merged.push({ ...run });
    return merged;
  }, []);
}

function hasText(runs: Run[]): boolean {
  return runs.some((run) => run.t.trim() !== "");
}

/** The editor's DOM → the blocks the article page renders. */
export function htmlToBlocks(root: HTMLElement): BlogBlock[] {
  const blocks: BlogBlock[] = [];

  const pushParagraph = (node: Node) => {
    const runs = runsFrom(node);
    if (hasText(runs)) blocks.push({ t: "p", runs });
  };

  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? "";
      if (text.trim()) blocks.push({ t: "p", runs: [{ t: text }] });
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const element = child as HTMLElement;

    switch (element.tagName) {
      case "H2":
      case "H1":
      case "H3": {
        // Everything headed becomes an H2: the article page has one heading
        // level, because the post title is already the H1.
        const text = element.textContent?.trim() ?? "";
        if (text) blocks.push({ t: "h2", text });
        break;
      }

      case "UL":
      case "OL": {
        const items = Array.from(element.querySelectorAll("li"))
          .map((li) => runsFrom(li))
          .filter(hasText);
        if (items.length > 0) blocks.push({ t: "ul", items });
        break;
      }

      case "IMG": {
        const src = element.getAttribute("src");
        if (src) {
          blocks.push({ t: "image", src, alt: element.getAttribute("alt") ?? "" });
        }
        break;
      }

      case "FIGURE": {
        const image = element.querySelector("img");
        const src = image?.getAttribute("src");
        if (src) {
          blocks.push({ t: "image", src, alt: image?.getAttribute("alt") ?? "" });
        }
        break;
      }

      default:
        // P, DIV and anything else a browser produced for a line of text.
        // An image the browser wrapped in a div is lifted out rather than lost.
        if (element.querySelector("img")) {
          const image = element.querySelector("img")!;
          const src = image.getAttribute("src");
          if (src) {
            blocks.push({ t: "image", src, alt: image.getAttribute("alt") ?? "" });
          }
          break;
        }
        pushParagraph(element);
    }
  }

  return blocks;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function runsToHtml(runs: Run[]): string {
  return runs
    .map((run) => {
      let html = escapeHtml(run.t);
      if (run.b) html = `<strong>${html}</strong>`;
      if (run.i) html = `<em>${html}</em>`;
      if (run.href) html = `<a href="${escapeHtml(run.href)}">${html}</a>`;
      return html;
    })
    .join("");
}

/** The stored blocks → the HTML the editor starts from. */
export function blocksToHtml(blocks: BlogBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.t) {
        case "p":
          return `<p>${runsToHtml(block.runs)}</p>`;
        case "h2":
          return `<h2>${escapeHtml(block.text)}</h2>`;
        case "ul":
          return `<ul>${block.items
            .map((item) => `<li>${runsToHtml(item)}</li>`)
            .join("")}</ul>`;
        case "image":
          return block.src
            ? `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">`
            : "";
      }
    })
    .join("");
}

/** The character count shown against the editor's limit. */
export function blocksLength(blocks: BlogBlock[]): number {
  return blocks.reduce((total, block) => {
    switch (block.t) {
      case "p":
        return total + block.runs.reduce((n, run) => n + run.t.length, 0);
      case "h2":
        return total + block.text.length;
      case "ul":
        return (
          total +
          block.items.reduce(
            (n, item) => n + item.reduce((m, run) => m + run.t.length, 0),
            0
          )
        );
      case "image":
        return total;
    }
  }, 0);
}
