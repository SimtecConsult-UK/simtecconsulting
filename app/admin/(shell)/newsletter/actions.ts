"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { slugify } from "../../../lib/blog/slug";
import { validatePost } from "./limits";
import type { SaveState } from "../../validation";
import type { BlogBlock, FaqPair, Post } from "../../../lib/blog/types";

/**
 * Writes for the newsletter.
 *
 * Every one of these starts with `requireEditor()`. A Server Action is a real
 * endpoint that anyone can call, so it is checked here rather than relying on
 * the page that rendered the form; behind that, row-level security refuses the
 * write outright to anyone not signed in.
 */

export type PostInput = {
  id: string | null;
  slug: string;
  title: string;
  standfirst: string;
  body: BlogBlock[];
  coverPath: string | null;
  coverAlt: string;
  coverWidth: number | null;
  coverHeight: number | null;
  status: "draft" | "published";
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  keyTakeaway: string;
  faqs: FaqPair[];
  schemaType: Post["seo"]["schemaType"];
};

/** Publishing is what changes the live site, so those pages are refreshed. */
function refreshPublicPages(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function savePost(input: PostInput): Promise<SaveState> {
  await requireEditor();

  const problem = validatePost(input);
  if (problem) return { error: problem };

  const slug = slugify(input.slug || input.title);
  if (!slug) return { error: "That title does not make a usable web address. Add some letters or numbers." };

  const supabase = await createClient();

  const row = {
    slug,
    title: input.title.trim(),
    standfirst: input.standfirst.trim(),
    body: input.body,
    cover_path: input.coverPath,
    cover_alt: input.coverAlt.trim(),
    cover_width: input.coverWidth,
    cover_height: input.coverHeight,
    status: input.status,
    // A post going live for the first time is dated today; an edit keeps the
    // date it was originally published under.
    published_at:
      input.status === "published"
        ? input.publishedAt || new Date().toISOString().slice(0, 10)
        : input.publishedAt,
    meta_title: input.metaTitle.trim() || null,
    meta_description: input.metaDescription.trim() || null,
    key_takeaway: input.keyTakeaway.trim() || null,
    faqs: input.faqs.filter((pair) => pair.q.trim() && pair.a.trim()),
    schema_type: input.schemaType,
  };

  const query = input.id
    ? supabase.from("posts").update(row).eq("id", input.id).select("id").maybeSingle()
    : supabase.from("posts").insert(row).select("id").maybeSingle();

  const { data, error } = await query;

  if (error) {
    // 23505 is Postgres' unique-violation code; here it can only be the slug.
    if (error.code === "23505") {
      return {
        error: `Another post already uses the web address "${slug}". Change the title, or set a different address under Search & AI visibility.`,
      };
    }
    return { error: `Could not save: ${error.message}` };
  }

  refreshPublicPages(slug);
  revalidatePath("/admin/newsletter");

  // A new post gets its own URL so a refresh does not create a second copy.
  if (!input.id && data?.id) redirect(`/admin/newsletter/${data.id}`);

  return { error: null };
}

export async function deletePost(id: string, slug: string) {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return { error: `Could not delete: ${error.message}` };
  }

  refreshPublicPages(slug);
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter");
}
