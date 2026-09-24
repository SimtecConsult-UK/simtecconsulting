import { cache } from "react";
import { POSTS } from "./content";
import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/config";
import { BUCKETS, publicUrl } from "../supabase/storage";
import type { BlogBlock, FaqPair, Post, PostSummary } from "./types";

/**
 * The blog's data layer. Every page and component goes through these functions,
 * so this file is the only thing that knows where posts come from.
 *
 * Until a Supabase project is configured it serves the samples committed in
 * `content.ts`, which keeps `npm run dev` working on a fresh clone and means a
 * missing environment variable cannot take the blog down.
 */

/** How many articles the related band shows. */
const RELATED_COUNT = 3;

/** Every column a post page needs. */
const POST_COLUMNS =
  "slug,title,standfirst,body,cover_path,cover_alt,cover_width,cover_height,published_at,updated_at,status,meta_title,meta_description,key_takeaway,faqs,schema_type";

/**
 * The columns a card needs — deliberately not `*`. A card shows a title, date,
 * standfirst and cover; `body` and `faqs` are the two largest columns in the
 * table and an index page has no use for either.
 */
const SUMMARY_COLUMNS =
  "slug,title,standfirst,cover_path,cover_alt,cover_width,cover_height,published_at";

type PostRow = {
  slug: string;
  title: string;
  standfirst: string;
  body?: BlogBlock[] | null;
  cover_path: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  published_at: string;
  updated_at?: string | null;
  status?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  key_takeaway?: string | null;
  faqs?: FaqPair[] | null;
  schema_type?: Post["seo"]["schemaType"] | null;
};

function toCover(row: PostRow) {
  return {
    src: publicUrl(BUCKETS.blogImages, row.cover_path),
    alt: row.cover_alt ?? "",
    // Covers are uploaded at 1600×900; the stored size wins when it differs.
    width: row.cover_width ?? 1600,
    height: row.cover_height ?? 900,
  };
}

function toSummary(row: PostRow): PostSummary {
  return {
    slug: row.slug,
    title: row.title,
    standfirst: row.standfirst,
    cover: toCover(row),
    publishedAt: row.published_at,
  };
}

function toPost(row: PostRow): Post {
  return {
    ...toSummary(row),
    updatedAt: row.updated_at ?? null,
    status: row.status === "draft" ? "draft" : "published",
    body: row.body ?? [],
    seo: {
      metaTitle: row.meta_title ?? null,
      metaDescription: row.meta_description ?? null,
      keyTakeaway: row.key_takeaway ?? null,
      faqs: row.faqs ?? [],
      schemaType: row.schema_type ?? "Article",
    },
  };
}

/** The committed samples already are `Post`s; they only need narrowing. */
function postToSummary(post: Post): PostSummary {
  const { slug, title, standfirst, cover, publishedAt } = post;
  return { slug, title, standfirst, cover, publishedAt };
}

/** The committed samples, newest first — the fallback when nothing is connected. */
function samples(): Post[] {
  return POSTS.filter((post) => post.status === "published").sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0
  );
}

/**
 * A read that failed is logged and treated as "no posts", so a blip at Supabase
 * shows the blog's own empty state rather than a 500. It never falls back to
 * the samples: lorem ipsum appearing on the live blog would be worse than an
 * empty page.
 */
function logRead(where: string, error: { message: string }) {
  console.error(`[blog] ${where}: ${error.message}`);
}

/**
 * The index: the newest post for the featured block, the rest for the grid.
 * `featured` is null only when nothing is published at all.
 */
export const getIndex = cache(
  async (): Promise<{ featured: PostSummary | null; rest: PostSummary[] }> => {
    const split = (posts: PostSummary[]) => ({
      featured: posts[0] ?? null,
      rest: posts.slice(1),
    });

    if (!isSupabaseConfigured) return split(samples().map(postToSummary));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(SUMMARY_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      logRead("index", error);
      return { featured: null, rest: [] };
    }
    return split((data as PostRow[]).map(toSummary));
  }
);

export const getPost = cache(async (slug: string): Promise<Post | undefined> => {
  if (!isSupabaseConfigured) return samples().find((post) => post.slug === slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    logRead(`post ${slug}`, error);
    return undefined;
  }
  return data ? toPost(data as PostRow) : undefined;
});

/** Every published slug — used to pre-render the post pages at build time. */
export const getPostSlugs = cache(async (): Promise<string[]> => {
  if (!isSupabaseConfigured) return samples().map((post) => post.slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");

  if (error) {
    logRead("slugs", error);
    return [];
  }
  return (data as { slug: string }[]).map((row) => row.slug);
});

/** The related-articles band: the newest posts other than the one being read. */
export const getRelatedPosts = cache(
  async (slug: string): Promise<PostSummary[]> => {
    if (!isSupabaseConfigured) {
      return samples()
        .filter((post) => post.slug !== slug)
        .slice(0, RELATED_COUNT)
        .map(postToSummary);
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(SUMMARY_COLUMNS)
      .eq("status", "published")
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(RELATED_COUNT);

    if (error) {
      logRead(`related to ${slug}`, error);
      return [];
    }
    return (data as PostRow[]).map(toSummary);
  }
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
