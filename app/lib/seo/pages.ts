import { POLICY_COUNT } from "../legal/catalog";
import { ROUTES } from "../sections";
import type { PageSchemaType } from "./types";

/**
 * The pages the CMS can describe to search engines, and what they say when
 * nobody has customised them.
 *
 * The list is fixed in code rather than stored, because these are real routes
 * in `app/` — an editor cannot invent a page by typing an address, and a page
 * that is deleted from the site stops being offered here. What *is* stored is
 * only the wording, in the `page_seo` table.
 *
 * `fallbackTitle` and `fallbackDescription` are the exact words each page
 * carried before the CMS existed, so an untouched database leaves the live site
 * byte for byte as it was.
 *
 * Deliberately absent:
 *  - `/blog/<post>` — each post carries its own panel in the Newsletter editor.
 *  - `/policies/<policy>` — thirty pages generated from the signed PDFs; their
 *    titles come from the documents and should not drift from them.
 *  - `/discovery` and `/terms-2` — both excluded from search in app/robots.ts,
 *    so there is nothing for a search listing to change.
 */

export type SeoPage = {
  /** The segment under /admin/seo. Checked against RESERVED_IDS below. */
  id: string;
  /** The page's address on the live site, and the key of its stored row. */
  path: string;
  /** How the page is named in the CMS list. */
  name: string;
  /** One line telling the editor which page this is. */
  blurb: string;
  fallbackTitle: string;
  fallbackDescription: string;
  /** What this page is, before anybody chooses otherwise. */
  defaultSchemaType: PageSchemaType;
};

export const SEO_PAGES: SeoPage[] = [
  {
    id: "home",
    path: ROUTES.home,
    name: "Homepage",
    blurb: "The front page, and the one most search results point at.",
    fallbackTitle: "Simtec — Construction management software",
    fallbackDescription:
      "Construction management software that helps teams deliver projects faster, safer, and on budget.",
    defaultSchemaType: "WebPage",
  },
  {
    id: "newsletter",
    path: ROUTES.blog,
    name: "Newsletter index",
    blurb: "The list of posts at /blog. Each post has its own panel in Newsletter.",
    fallbackTitle: "Notes from the floor — Simtec",
    fallbackDescription:
      "The Simtec newsletter — notes on environmental consultancy, construction data and the software we build for site teams.",
    defaultSchemaType: "CollectionPage",
  },
  {
    id: "policies",
    path: ROUTES.policies,
    name: "Policies",
    blurb: "The policy browser. The individual policies come from the signed PDFs.",
    fallbackTitle: "Policies — Simtec",
    fallbackDescription: `The ${POLICY_COUNT} policies that govern how Simtec Consult operates, each reviewed annually and available to download.`,
    defaultSchemaType: "CollectionPage",
  },
  {
    id: "terms",
    path: ROUTES.terms,
    name: "General terms",
    blurb: "The customer terms that apply to any Simtec service.",
    fallbackTitle: "General Terms — Simtec",
    fallbackDescription:
      "The general customer terms that apply to any Simtec service, including licensing, subscription and professional services.",
    defaultSchemaType: "WebPage",
  },
];

/**
 * Segments under /admin/seo that are routes in their own right.
 *
 * Next resolves a static segment ahead of the `[page]` one, so a catalogue
 * entry using this id would silently open the site-wide settings editor and its
 * own settings would be unreachable — with the row still listed and counted, so
 * nothing would say why. Checked at import, which fails the build rather than
 * letting it ship.
 */
const RESERVED_IDS = ["site"];

const clash = SEO_PAGES.find(
  (page, index) =>
    RESERVED_IDS.includes(page.id) ||
    SEO_PAGES.findIndex((other) => other.id === page.id) !== index
);

if (clash) {
  throw new Error(
    `[seo] the page id "${clash.id}" is already a route under /admin/seo, or is used twice. Give it another id.`
  );
}

/** The page at an admin segment, or undefined — the editor 404s on undefined. */
export function seoPageById(id: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.id === id);
}

/** The catalogue entry for a live path, used by the public pages themselves. */
export function seoPageByPath(path: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.path === path);
}
