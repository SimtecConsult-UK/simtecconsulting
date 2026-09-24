import type { CaseStudyChapter } from "../../../lib/caseStudies";

/**
 * A chapter is written in one box.
 *
 * The section renders a chapter as opening paragraphs, then a bullet list, then
 * any closing paragraphs — which is what `CaseStudyChapter` stores and what the
 * type's own note describes as "a single rich-text field... split into the
 * paragraphs before the list, the bullets, and the paragraphs after it".
 * Splitting that into three boxes asked the editor to describe one run of prose
 * in three places; here a line beginning with a dash is a bullet, and where the
 * bullets sit decides which paragraphs are opening and which are closing.
 *
 * Nothing here is stored: the editor keeps what was typed exactly as typed, and
 * these only translate it on the way in and out.
 */

const BULLET = /^[-*•]\s*/;

/** What was typed → the three parts the homepage renders. */
export function textToChapter(text: string): CaseStudyChapter {
  const chapter: CaseStudyChapter = { paragraphs: [], bullets: [], closing: [] };

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (BULLET.test(trimmed)) {
      const bullet = trimmed.replace(BULLET, "").trim();
      if (bullet) chapter.bullets.push(bullet);
      continue;
    }

    // Once the list has started, a paragraph can only be a closing one.
    if (chapter.bullets.length > 0) chapter.closing.push(trimmed);
    else chapter.paragraphs.push(trimmed);
  }

  return chapter;
}

/** The stored parts → the text the box opens with. */
export function chapterToText(chapter: CaseStudyChapter): string {
  return [
    ...chapter.paragraphs,
    ...chapter.bullets.map((bullet) => `- ${bullet}`),
    ...chapter.closing,
  ].join("\n");
}
