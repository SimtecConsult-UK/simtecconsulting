import type { FaqPair } from "../blog/types";

/**
 * The website's own search and AI-visibility settings — everything the CMS's
 * "SEO & AI" section edits.
 *
 * These mirror the post editor's "Search & AI visibility" panel on purpose: a
 * page and a post are described to Google and to an AI assistant in the same
 * way, so the same fields, the same limits and the same editor components do
 * for both. What a page does not have is a body, a cover or a publish date.
 */

export type { FaqPair };

/**
 * What kind of thing the page is, in schema.org's vocabulary. Posts choose
 * between Article types; a page is one of these.
 */
export type PageSchemaType = "WebPage" | "AboutPage" | "CollectionPage" | "Service";

export const PAGE_SCHEMA_TYPES: { value: PageSchemaType; label: string }[] = [
  { value: "WebPage", label: "Web page" },
  { value: "AboutPage", label: "About page" },
  { value: "CollectionPage", label: "Collection" },
  { value: "Service", label: "Service" },
];

/** A picture held in storage, as both the stored path and a URL to show it. */
export type StoredImage = {
  path: string | null;
  url: string | null;
  width: number | null;
  height: number | null;
};

export const NO_IMAGE: StoredImage = { path: null, url: null, width: null, height: null };

/**
 * One page's overrides. Every field is "unset" by default, and an unset field
 * falls back — first to the site-wide settings, then to the wording committed
 * in `pages.ts`.
 */
export type PageSeo = {
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  shareImage: StoredImage;
  keyTakeaway: string | null;
  faqs: FaqPair[];
  schemaType: PageSchemaType;
  /** Keeps the page out of search results entirely. Off by default. */
  noindex: boolean;
};

/** The settings that apply to the whole site rather than to any one page. */
export type SiteSettings = {
  siteName: string;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  /** The browser-tab icon. Null leaves the committed /favicon.ico in place. */
  favicon: StoredImage;
  /** The picture used when a page with none of its own is shared. */
  socialImage: StoredImage;
  orgLegalName: string | null;
  orgDescription: string | null;
  /** The company's other official profiles, as plain URLs. */
  orgSameAs: string[];
};

/**
 * What the site uses before anybody has opened the CMS — the words the root
 * layout carried before these settings existed. Held here rather than borrowed
 * from the homepage's catalogue entry, which is a different idea that happens
 * to have the same wording today.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Simtec",
  defaultMetaTitle: "Simtec — Construction management software",
  defaultMetaDescription:
    "Construction management software that helps teams deliver projects faster, safer, and on budget.",
  favicon: NO_IMAGE,
  socialImage: NO_IMAGE,
  // The name the blog's structured data has always published as the publisher.
  orgLegalName: "Simtec Consult Ltd",
  orgDescription: null,
  orgSameAs: [],
};

/**
 * A page with nothing customised.
 *
 * `schemaType` is passed in rather than looked up, because the catalogue in
 * `pages.ts` already imports this file and the two must not import each other.
 */
export function blankPageSeo(path: string, schemaType: PageSchemaType = "WebPage"): PageSeo {
  return {
    path,
    metaTitle: null,
    metaDescription: null,
    shareImage: NO_IMAGE,
    keyTakeaway: null,
    faqs: [],
    schemaType,
    noindex: false,
  };
}
