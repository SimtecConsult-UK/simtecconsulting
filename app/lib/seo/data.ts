import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../supabase/config";
import { supabasePublic } from "../supabase/public";
import { BUCKETS, publicUrl } from "../supabase/storage";
import type { FaqPair } from "../blog/types";
import { seoPageByPath } from "./pages";
import {
  DEFAULT_SITE_SETTINGS,
  NO_IMAGE,
  blankPageSeo,
  type PageSchemaType,
  type PageSeo,
  type SiteSettings,
  type StoredImage,
} from "./types";

/**
 * Where the site's own meta data comes from.
 *
 * Every public page goes through here, so this file is the only thing that
 * knows these words live in a database. With no Supabase project configured —
 * a fresh clone, a preview with no environment variables — it returns the
 * "nothing customised" values and the pages fall back to the wording committed
 * in `pages.ts`, exactly as the site behaved before the CMS existed.
 *
 * `cache` means a page that asks for its settings in `generateMetadata` and
 * again while rendering its structured data pays for one query, not two.
 */

export type SiteSettingsRow = {
  site_name: string | null;
  default_meta_title: string | null;
  default_meta_description: string | null;
  favicon_path: string | null;
  social_image_path: string | null;
  social_image_width: number | null;
  social_image_height: number | null;
  org_legal_name: string | null;
  org_description: string | null;
  org_same_as: string[] | null;
};

export type PageSeoRow = {
  path: string;
  meta_title: string | null;
  meta_description: string | null;
  share_image_path: string | null;
  share_image_width: number | null;
  share_image_height: number | null;
  key_takeaway: string | null;
  faqs: FaqPair[] | null;
  schema_type: PageSchemaType | null;
  noindex: boolean | null;
};

export const SITE_SETTINGS_COLUMNS =
  "site_name,default_meta_title,default_meta_description,favicon_path,social_image_path,social_image_width,social_image_height,org_legal_name,org_description,org_same_as";

export const PAGE_SEO_COLUMNS =
  "path,meta_title,meta_description,share_image_path,share_image_width,share_image_height,key_takeaway,faqs,schema_type,noindex";

function toImage(path: string | null, width?: number | null, height?: number | null): StoredImage {
  if (!path) return NO_IMAGE;
  return {
    path,
    url: publicUrl(BUCKETS.siteAssets, path),
    width: width ?? null,
    height: height ?? null,
  };
}

/** Blank strings are how an emptied field arrives; they mean "not set". */
function orNull(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: orNull(row.site_name) ?? DEFAULT_SITE_SETTINGS.siteName,
    defaultMetaTitle: orNull(row.default_meta_title),
    defaultMetaDescription: orNull(row.default_meta_description),
    favicon: toImage(row.favicon_path),
    socialImage: toImage(row.social_image_path, row.social_image_width, row.social_image_height),
    orgLegalName: orNull(row.org_legal_name),
    orgDescription: orNull(row.org_description),
    orgSameAs: (row.org_same_as ?? []).filter((url) => typeof url === "string" && url.trim()),
  };
}

export function toPageSeo(row: PageSeoRow): PageSeo {
  return {
    path: row.path,
    metaTitle: orNull(row.meta_title),
    metaDescription: orNull(row.meta_description),
    shareImage: toImage(row.share_image_path, row.share_image_width, row.share_image_height),
    keyTakeaway: orNull(row.key_takeaway),
    faqs: (row.faqs ?? []).filter((pair) => pair.q?.trim() && pair.a?.trim()),
    schemaType: row.schema_type ?? "WebPage",
    noindex: row.noindex ?? false,
  };
}

/**
 * The two reads, with the Supabase client handed in.
 *
 * The public site reads these tables with the anonymous client; the CMS reads
 * them with the signed-in editor's. Everything else about the two is the same —
 * the columns, the fall back to defaults when there is no row and when the
 * query fails — and the editor's whole job is to show what the live page will
 * say, so the two must not be able to disagree. `app/admin/(shell)/seo/data.ts`
 * passes its own client to these.
 */
export async function readSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select(SITE_SETTINGS_COLUMNS)
    .maybeSingle();

  if (error) {
    console.error(`[seo] site settings: ${error.message}`);
    return DEFAULT_SITE_SETTINGS;
  }
  return data ? toSiteSettings(data as SiteSettingsRow) : DEFAULT_SITE_SETTINGS;
}

export async function readPageSeo(
  supabase: SupabaseClient,
  path: string
): Promise<PageSeo> {
  const blank = blankPageSeo(path, seoPageByPath(path)?.defaultSchemaType);

  const { data, error } = await supabase
    .from("page_seo")
    .select(PAGE_SEO_COLUMNS)
    .eq("path", path)
    .maybeSingle();

  if (error) {
    console.error(`[seo] page ${path}: ${error.message}`);
    return blank;
  }
  return data ? toPageSeo(data as PageSeoRow) : blank;
}

/**
 * The site-wide settings as the public site reads them. One row exists from the
 * migration onwards; a missing row, or no project at all, gives the untouched
 * defaults rather than an error, because a page must still render its own head.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return DEFAULT_SITE_SETTINGS;
  return readSiteSettings(supabasePublic());
});

/**
 * One page's stored overrides, or a blank set. A page with no row has simply
 * never been edited, which is not an error — it is every page on day one.
 */
export const getPageSeo = cache(async (path: string): Promise<PageSeo> => {
  if (!isSupabaseConfigured) {
    return blankPageSeo(path, seoPageByPath(path)?.defaultSchemaType);
  }
  return readPageSeo(supabasePublic(), path);
});
