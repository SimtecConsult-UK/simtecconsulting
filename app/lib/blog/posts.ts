import { cache } from "react";
import { POSTS } from "./content";
import type { Post, PostSummary } from "./types";

/**
 * The blog's data layer. Every page and component goes through these functions
 * and none of them touch `content.ts` directly, so connecting the CMS means
 * re-implementing this file against Supabase and nothing else.
 *
 * The functions are `async` and wrapped in React's `cache` for that reason.
 * Today they read an array and the caching buys nothing; once each one is a
 * query, `cache` collapses the repeat calls a single page makes — a post page
 * asks for the same post twice, once for its metadata and once for its body —
 * into one round trip.
 */

/** How many articles the related band shows. */
const RELATED_COUNT = 3;

/**
 * Newest first. Drafts never reach the site.
 *
 * Against Supabase this becomes the `where status = 'published'
 * order by published_at desc` that the migration's partial index is built for,
 * rather than a filter and sort done here.
 */
const published = cache((): Post[] =>
  POSTS.filter((post) => post.status === "published").sort((a, b) =>
    // Plain comparison, not localeCompare: ISO dates already sort correctly as
    // text, and collation is far more expensive than it looks.
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0
  )
);

/**
 * The fields a card needs. Once this reads from Supabase, make it the column
 * list of the query rather than a filter applied afterwards — an index page
 * has no use for seven posts' worth of article body.
 */
function toSummary(post: Post): PostSummary {
  const { slug, title, standfirst, cover, publishedAt } = post;
  return { slug, title, standfirst, cover, publishedAt };
}

/**
 * The index: the newest post for the featured block, the rest for the grid.
 * `featured` is null only when nothing is published at all.
 */
export const getIndex = cache(
  async (): Promise<{ featured: PostSummary | null; rest: PostSummary[] }> => {
    const [featured, ...rest] = published();
    return {
      featured: featured ? toSummary(featured) : null,
      rest: rest.map(toSummary),
    };
  }
);

export const getPost = cache(
  async (slug: string): Promise<Post | undefined> =>
    published().find((post) => post.slug === slug)
);

/** Every published slug — used to pre-render the post pages at build time. */
export const getPostSlugs = cache(
  async (): Promise<string[]> => published().map((post) => post.slug)
);

/** The related-articles band: the newest posts other than the one being read. */
export const getRelatedPosts = cache(
  async (slug: string): Promise<PostSummary[]> =>
    published()
      .filter((post) => post.slug !== slug)
      .slice(0, RELATED_COUNT)
      .map(toSummary)
);

/**
 * "12 September 2026". Fixed to en-GB and UTC so the server and the browser
 * always agree — a locale-dependent date would hydrate differently for
 * visitors outside the UK.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(isoDate: string): string {
  return DATE_FORMAT.format(new Date(`${isoDate}T00:00:00Z`));
}
