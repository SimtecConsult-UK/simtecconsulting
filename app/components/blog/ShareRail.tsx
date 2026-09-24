import { SITE_URL, postHref } from "../../lib/sections";

/** The three destinations, as drawn. `url` and `title` arrive encoded. */
const TARGETS = [
  {
    label: "Share on LinkedIn",
    glyph: "in",
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  },
  {
    label: "Share on X",
    glyph: "X",
    href: (url: string, title: string) =>
      `https://x.com/intent/tweet?url=${url}&text=${title}`,
  },
  {
    label: "Share by email",
    glyph: "@",
    href: (url: string, title: string) =>
      `mailto:?subject=${title}&body=${url}`,
  },
];

type ShareRailProps = {
  slug: string;
  title: string;
};

/**
 * LinkedIn / X / email, as drawn. Plain links with absolute URLs built on the
 * server, so they work without JavaScript and share the right address even
 * when the page is opened from a search result.
 *
 * Placement is the stylesheet's job: a sticky rail in the left gutter from
 * 1100px up, a horizontal row under the title block below that.
 */
export function ShareRail({ slug, title }: ShareRailProps) {
  const url = encodeURIComponent(`${SITE_URL}${postHref(slug)}`);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="bl-col bl-share">
      <span className="bl-meta bl-share-label">Share</span>
      <div className="bl-share-links">
        {TARGETS.map((target) => (
          <a
            key={target.label}
            className="bl-share-btn"
            href={target.href(url, encodedTitle)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={target.label}
          >
            <span className="bl-share-glyph" aria-hidden="true">
              {target.glyph}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
