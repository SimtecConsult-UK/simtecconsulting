import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import type { BlogBlock, FaqPair, Post } from "../../../lib/blog/types";

/**
 * Reads for the editor, which — unlike the public site — must see drafts too.
 * The signed-in editor's own row-level security is what allows that; the same
 * query run by a visitor would return published rows only.
 */

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  coverUrl: string | null;
};

export type EditablePost = Omit<Post, "cover"> & {
  id: string;
  cover: { path: string | null; url: string | null; alt: string };
};

type Row = {
  id: string;
  slug: string;
  title: string;
  standfirst: string;
  body: BlogBlock[] | null;
  cover_path: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  status: string;
  published_at: string | null;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  key_takeaway: string | null;
  faqs: FaqPair[] | null;
  schema_type: Post["seo"]["schemaType"] | null;
};

export async function listPosts(): Promise<PostListItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,slug,title,status,published_at,updated_at,cover_path")
    // Drafts first, then newest. A post being written is what you came for.
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(`[cms] list posts: ${error.message}`);
    return [];
  }

  return (data as Row[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status === "draft" ? "draft" : "published",
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    coverUrl: publicUrl(BUCKETS.blogImages, row.cover_path),
  }));
}

export async function getPostForEdit(id: string): Promise<EditablePost | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`[cms] load post ${id}: ${error.message}`);
    return null;
  }
  if (!data) return null;

  const row = data as Row;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    standfirst: row.standfirst,
    body: row.body ?? [],
    status: row.status === "draft" ? "draft" : "published",
    publishedAt: row.published_at ?? "",
    updatedAt: row.updated_at,
    cover: {
      path: row.cover_path,
      url: publicUrl(BUCKETS.blogImages, row.cover_path),
      alt: row.cover_alt ?? "",
    },
    seo: {
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      keyTakeaway: row.key_takeaway,
      faqs: row.faqs ?? [],
      schemaType: row.schema_type ?? "Article",
    },
  };
}
