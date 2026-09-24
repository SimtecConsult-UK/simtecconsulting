export const SECTION_IDS = {
  solutions: "solutions",
  team: "team",
  caseStudies: "case-studies",
  testimonials: "testimonials",
} as const;

export const ROUTES = {
  home: "/",
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
).replace(/\/$/, "");

/** The path of one blog post. Keeps `/blog` spelt in exactly one place. */
export function postHref(slug: string): string {
  return `${ROUTES.blog}/${slug}`;
}
