export const SECTION_IDS = {
  solutions: "solutions",
  team: "team",
  caseStudies: "case-studies",
  testimonials: "testimonials",
} as const;

/**
 * Where the "Book a Workshop" CTAs send people. External scheduling, so these
 * are plain anchors opened in a new tab rather than next/link — the visitor
 * keeps the site open behind the booking page.
 *
 * ROUTES.discovery is no longer linked from anywhere on the site; it stays
 * reachable by direct link for the people we send to it.
 */
export const BOOKING_URL = "https://calendly.com/simtec/simtec-software";

export const ROUTES = {
  home: "/",
  /** The discovery questionnaire. Issued by direct link; see BOOKING_URL. */
  discovery: "/discovery",
  blog: "/blog",
  /** The content manager. Signed-in editors only, and kept out of search. */
  admin: "/admin",
  policies: "/policies",
  terms: "/terms",
  /** Unlisted variant issued to specific support customers. */
  termsProject: "/terms-2",
} as const;

/**
 * The site's public origin, used for canonical URLs and share links, which
 * both have to be absolute. Set NEXT_PUBLIC_SITE_URL per environment so
 * previews do not advertise the production address.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://simtecconsult.com"
)
  // Trimmed and de-slashed for the same reason as SUPABASE_URL: paths are
  // joined onto this, and "…com//blog/x" is a different URL to Google.
  .trim()
  .replace(/\/+$/, "");

/**
 * The same address without its scheme, for the places that show a URL to a
 * person rather than follow it — the search-result previews in the CMS.
 */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

/**
 * A site path as an absolute URL, for the places that cannot use a relative one
 * — JSON-LD and share links. Anything already absolute is left alone: images
 * stored in Supabase come back as full URLs, and prefixing the site's own
 * address to those produced links like "https://simtec.../https://xyz...".
 */
export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/** The path of one blog post. Keeps `/blog` spelt in exactly one place. */
export function postHref(slug: string): string {
  return `${ROUTES.blog}/${slug}`;
}
