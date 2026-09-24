/**
 * The shape of a newsletter post.
 *
 * These fields mirror the post editor in the Simtec CMS handover one for one, so
 * that swapping the seed content in `content.ts` for CMS rows means rewriting
 * `posts.ts` alone — no page or component changes.
 */

/** A span of text inside a paragraph or list item. Runs concatenate directly. */
export type Run = {
  t: string;
  /** Bold — the editor's "B". */
  b?: true;
  /** Italic — the editor's "I". */
  i?: true;
  /** Hyperlink — the editor's "Link". */
  href?: string;
};

export type BlogBlock =
  | { t: "p"; runs: Run[] }
  /** The editor's "H2". Posts have no H1 in the body; the title supplies it. */
  | { t: "h2"; text: string }
  /** The editor's "List". */
  | { t: "ul"; items: Run[][] }
  /** The editor's "Image". */
  | { t: "image"; src: string | null; alt: string };

export type FaqPair = { q: string; a: string };

/** Everything behind the editor's "Search & AI visibility" panel. */
export type PostSeo = {
  /** Falls back to the post title. */
  metaTitle: string | null;
  /** Falls back to the standfirst. */
  metaDescription: string | null;
  /** The plain-language answer that AI assistants are meant to quote. */
  keyTakeaway: string | null;
  faqs: FaqPair[];
  schemaType: "Article" | "NewsArticle" | "HowTo";
};

export type PostImage = {
  /** `null` until a real picture is uploaded — the design's striped placeholder. */
  src: string | null;
  alt: string;
  /** Intrinsic size, needed by next/image. Cover images are shot at 1600×900. */
  width: number;
  height: number;
};

export type Post = {
  slug: string;
  title: string;
  /** One or two sentences. Shown on the index and as the post's lead paragraph. */
  standfirst: string;
  cover: PostImage;
  /** ISO date (`2026-09-12`). Rendered as "12 September 2026". */
  publishedAt: string;
  /** ISO date, or `null` when the post has not been revised since publishing. */
  updatedAt: string | null;
  status: "draft" | "published";
  body: BlogBlock[];
  seo: PostSeo;
};

/** The subset the index and related-article cards need. */
export type PostSummary = Pick<
  Post,
  "slug" | "title" | "standfirst" | "cover" | "publishedAt"
>;
