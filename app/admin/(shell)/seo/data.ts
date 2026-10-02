import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import {
  PAGE_SEO_COLUMNS,
  readPageSeo,
  readSiteSettings,
  toPageSeo,
  type PageSeoRow,
} from "../../../lib/seo/data";
import { seoPageByPath } from "../../../lib/seo/pages";
import { DEFAULT_SITE_SETTINGS, blankPageSeo, type PageSeo, type SiteSettings } from "../../../lib/seo/types";

/**
 * Reads for the SEO editor.
 *
 * The reads themselves live in `app/lib/seo/data.ts` and are called here with
 * the cookie-bound client, so they run as the signed-in editor. Sharing them
 * rather than restating the queries is the point: the editor must show exactly
 * what the live page will say, down to how it falls back when there is no row.
 *
 * Only `listPageSeo` is new — nothing on the public site ever wants every page
 * at once.
 */

export async function getSiteSettingsForEdit(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return DEFAULT_SITE_SETTINGS;
  return readSiteSettings(await createClient());
}

/**
 * Every stored page row, keyed by path. The list page needs all of them at once
 * to say which pages have been customised, and there are only ever a handful.
 */
export async function listPageSeo(): Promise<Map<string, PageSeo>> {
  if (!isSupabaseConfigured) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase.from("page_seo").select(PAGE_SEO_COLUMNS);

  if (error) {
    console.error(`[cms] list page seo: ${error.message}`);
    return new Map();
  }

  return new Map(
    (data as PageSeoRow[]).map((row) => {
      const page = toPageSeo(row);
      return [page.path, page];
    })
  );
}

/** One page's stored settings, or a blank set for a page nobody has edited. */
export async function getPageSeoForEdit(path: string): Promise<PageSeo> {
  if (!isSupabaseConfigured) {
    return blankPageSeo(path, seoPageByPath(path)?.defaultSchemaType);
  }
  return readPageSeo(await createClient(), path);
}
