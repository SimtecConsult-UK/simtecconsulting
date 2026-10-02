"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { seoPageByPath } from "../../../lib/seo/pages";
import type { PageSchemaType } from "../../../lib/seo/types";
import type { FaqPair } from "../../../lib/blog/types";
import type { SaveState } from "../../validation";
import { pageTooLong, validateSiteSettings } from "./limits";

/**
 * Writes for the site's search and AI settings.
 *
 * Like every other action in the CMS these start with `requireEditor()`, because
 * a Server Action is a real endpoint anyone can call; row-level security refuses
 * the write behind it regardless.
 */

export type SiteSettingsInput = {
  siteName: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  faviconPath: string | null;
  socialImagePath: string | null;
  socialImageWidth: number | null;
  socialImageHeight: number | null;
  orgLegalName: string;
  orgDescription: string;
  orgSameAs: string[];
};

export type PageSeoInput = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  shareImagePath: string | null;
  shareImageWidth: number | null;
  shareImageHeight: number | null;
  keyTakeaway: string;
  faqs: FaqPair[];
  schemaType: PageSchemaType;
  noindex: boolean;
};

/** An emptied field is stored as "nothing set", not as an empty string. */
function orNull(value: string): string | null {
  return value.trim() || null;
}

export async function saveSiteSettings(input: SiteSettingsInput): Promise<SaveState> {
  await requireEditor();

  const problem = validateSiteSettings(input);
  if (problem) return { error: problem };

  const supabase = await createClient();
  // Upserted rather than updated. The migration inserts the single row, but an
  // update against a row that is not there reports success having changed
  // nothing, and the editor would say "Saved" over settings that were not.
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: true,
      site_name: input.siteName.trim(),
      default_meta_title: orNull(input.defaultMetaTitle),
      default_meta_description: orNull(input.defaultMetaDescription),
      favicon_path: input.faviconPath,
      social_image_path: input.socialImagePath,
      social_image_width: input.socialImageWidth,
      social_image_height: input.socialImageHeight,
      org_legal_name: orNull(input.orgLegalName),
      org_description: orNull(input.orgDescription),
      org_same_as: input.orgSameAs.map((url) => url.trim()).filter(Boolean),
    },
    // The table holds exactly one row, pinned by its primary key.
    { onConflict: "id" }
  );

  if (error) return { error: `Could not save: ${error.message}` };

  // The favicon and the default wording are part of the root layout, so every
  // page on the site carries them and every page has to be rebuilt.
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");

  return { error: null };
}

export async function savePageSeo(input: PageSeoInput): Promise<SaveState> {
  await requireEditor();

  // The address is never typed — it comes from the fixed list in pages.ts — so
  // anything else reaching here is a call that did not come from the editor.
  const page = seoPageByPath(input.path);
  if (!page) return { error: "That page is not one the site has." };

  const problem = pageTooLong(input);
  if (problem) return { error: problem };

  const supabase = await createClient();
  const { error } = await supabase.from("page_seo").upsert(
    {
      path: page.path,
      meta_title: orNull(input.metaTitle),
      meta_description: orNull(input.metaDescription),
      share_image_path: input.shareImagePath,
      share_image_width: input.shareImageWidth,
      share_image_height: input.shareImageHeight,
      key_takeaway: orNull(input.keyTakeaway),
      faqs: input.faqs.filter((pair) => pair.q.trim() && pair.a.trim()),
      schema_type: input.schemaType,
      noindex: input.noindex,
    },
    // One row per page: saving a second time updates the first rather than
    // adding a rival set of settings for the same address.
    { onConflict: "path" }
  );

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath(page.path);
  revalidatePath("/admin/seo");

  return { error: null };
}

/**
 * Throws the page's settings away so it goes back to the wording in the code.
 * Deleting the row rather than blanking the fields keeps "never customised" and
 * "customised back to the original" the same thing.
 */
export async function resetPageSeo(path: string): Promise<SaveState> {
  await requireEditor();

  const page = seoPageByPath(path);
  if (!page) return { error: "That page is not one the site has." };

  const supabase = await createClient();
  const { error } = await supabase.from("page_seo").delete().eq("path", page.path);

  if (error) return { error: `Could not reset: ${error.message}` };

  revalidatePath(page.path);
  revalidatePath("/admin/seo");

  return { error: null };
}
