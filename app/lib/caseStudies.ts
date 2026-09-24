/**
 * Homepage case studies.
 *
 * The shapes and the rules, not the content: the case studies themselves live
 * in the database and are edited in the CMS. Field names and the character
 * limits in the comments come from the handover, and the limits are what the
 * editor enforces — keeping to them holds the rendered heights in the range
 * the design was drawn for.
 *
 * The section renders at most MAX_HOMEPAGE_CASE_STUDIES of them.
 */

/**
 * One chapter tab. In the CMS this is a single rich-text field storing
 * `<p>` / `<ul>` / `<li>`, split at render time into the paragraphs before the
 * list, the bullets, and the paragraphs after it — which is exactly these three
 * keys. Total text across all three is capped at 1,200 characters per chapter.
 */
export type CaseStudyChapter = {
  /** Paragraphs above the bullets. */
  paragraphs: string[];
  /** One flat list. The section splits it into columns itself — never author columns. */
  bullets: string[];
  /** Paragraphs below the bullets. */
  closing: string[];
};

export type CaseStudy = {
  /** Stable key. Becomes the CMS record id. */
  id: string;
  /** Short client name in the switcher. Max 22 chars — must fit one line on tablet. */
  tabLabel: string;
  /** The section H2. Max 70 chars — wraps to at most 2 lines on a laptop. */
  headline: string;
  /** "Client" in the details bar. Max 40. */
  clientName: string;
  /** "System" in the details bar. Max 40. */
  systemName: string;
  /** "Project type" in the details bar. Max 120. */
  projectType: string;
  /**
   * Colour logo on a transparent background — it sits on white and on #f3f5ff.
   * `width`/`height` are the file's own pixel size, passed to the `<img>` as the
   * intrinsic-ratio hint; CSS still does the sizing.
   */
  logo: { src: string; width: number; height: number };
  /** Screen recording: 16:9, muted, loops. */
  video: string;
  /** Shown before play, on reduced motion and on slow connections. */
  videoPoster?: string;
  /**
   * The quote, without quote marks — the design adds them. Max 260 chars.
   * A blank line starts a new paragraph in the card.
   */
  quote: string;
  /**
   * Shown in capitals under the quote, e.g. "Tina · Compli Digital". Max 40.
   * Leave the name out rather than inventing one; the company alone reads fine.
   */
  quoteAttribution: string;
  chapters: {
    summary: CaseStudyChapter;
    problem: CaseStudyChapter;
    solution: CaseStudyChapter;
    value: CaseStudyChapter;
  };
};

/** The switcher is drawn for at most three clients. */
export const MAX_HOMEPAGE_CASE_STUDIES = 3;

/** Fixed in the design, not editable in the CMS. */
export const CHAPTERS = [
  { key: "summary", label: "Summary" },
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "value", label: "Impact" },
] as const;

export type ChapterKey = (typeof CHAPTERS)[number]["key"];

/** Open on load, on every breakpoint. */
export const DEFAULT_CHAPTER: ChapterKey = "solution";

/** The four chapters, as stored on a row and edited in the CMS. */
export type Chapters = CaseStudy["chapters"];

export const EMPTY_CHAPTER: CaseStudyChapter = {
  paragraphs: [],
  bullets: [],
  closing: [],
};

export const EMPTY_CHAPTERS: Chapters = {
  summary: EMPTY_CHAPTER,
  problem: EMPTY_CHAPTER,
  solution: EMPTY_CHAPTER,
  value: EMPTY_CHAPTER,
};

/** The `chapters` JSON column, which may be missing keys or absent entirely. */
export type StoredChapters =
  | Partial<Record<ChapterKey, Partial<CaseStudyChapter> | null>>
  | null;

/**
 * The stored JSON as four complete chapters. One copy, shared by the homepage
 * and the editor, so the same row can never be read two different ways.
 */
export function toChapters(stored: StoredChapters): Chapters {
  const read = (key: ChapterKey): CaseStudyChapter => {
    const value = stored?.[key];
    if (!value) return EMPTY_CHAPTER;
    return {
      paragraphs: value.paragraphs ?? [],
      bullets: value.bullets ?? [],
      closing: value.closing ?? [],
    };
  };

  return {
    summary: read("summary"),
    problem: read("problem"),
    solution: read("solution"),
    value: read("value"),
  };
}

/** The `case_studies` row. The editor selects two more columns on top of these. */
export type CaseStudyRow = {
  id: string;
  tab_label: string;
  headline: string;
  client_name: string;
  system_name: string;
  project_type: string;
  logo_path: string | null;
  logo_width: number | null;
  logo_height: number | null;
  video_path: string | null;
  video_poster_path: string | null;
  quote: string;
  quote_attribution: string;
  chapters: StoredChapters;
};

/** Splits a quote into its paragraphs on blank lines. */
export function quoteParagraphs(quote: string): string[] {
  return quote
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
