import type { MetadataRoute } from "next";
import { getSitemapPosts } from "./lib/blog/posts";
import { getPolicySlugs } from "./lib/legal/policies";
import { ROUTES, UNLISTED_ROUTES, absoluteUrl, policyHref, postHref } from "./lib/sections";
import { SEO_PAGES } from "./lib/seo/pages";

/**
 * Served at /sitemap.xml and pointed to from app/robots.ts.
 *
 * Route handlers don't inherit the root layout's timer, so this sets its own:
 * a newly published post shows up here as soon as it does on the blog.
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSitemapPosts();

  // The catalogue in seo/pages.ts lists every standalone public page.
  const pages = SEO_PAGES.filter(
    (page) =>
      !UNLISTED_ROUTES.includes(page.path) &&
      // Like the footer, offer the blog only once it has something in it.
      (page.path !== ROUTES.blog || posts.length > 0)
  ).map((page) => ({ url: absoluteUrl(page.path) }));

  const policies = getPolicySlugs().map((slug) => ({ url: absoluteUrl(policyHref(slug)) }));

  const articles = posts.map((post) => ({
    url: absoluteUrl(postHref(post.slug)),
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  return [...pages, ...policies, ...articles];
}
