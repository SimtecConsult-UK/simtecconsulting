import type { Metadata } from "next";
import { getPageSeo, getSiteSettings } from "./data";
import { seoPageByPath } from "./pages";
import { DEFAULT_SITE_SETTINGS, type PageSeo, type SiteSettings } from "./types";

/**
 * Turns the stored settings into the `<head>` of a public page.
 *
 * Two places a page's wording can come from, in this order:
 *
 *   what the CMS holds for this page  →  what `pages.ts` says it shipped with
 *
 * The site-wide default title and description are not a third link in that
 * chain: every page in `pages.ts` has wording of its own, so they would never
 * be reached. They apply in `siteMetadata` below — the root layout — which is
 * what anything *not* in `pages.ts` inherits.
 */

export type ResolvedPage = {
  page: PageSeo;
  settings: SiteSettings;
  /** What the browser tab and the search result will say. */
  title: string;
  description: string;
  /** The picture a share of this page shows, or null for none. */
  shareImage: { url: string; width: number | null; height: number | null } | null;
};

export async function resolvePage(path: string): Promise<ResolvedPage> {
  const [page, settings] = await Promise.all([getPageSeo(path), getSiteSettings()]);
  const fallback = seoPageByPath(path);

  const share = page.shareImage.url ? page.shareImage : settings.socialImage;

  return {
    page,
    settings,
    title: page.metaTitle ?? fallback?.fallbackTitle ?? settings.siteName,
    description: page.metaDescription ?? fallback?.fallbackDescription ?? "",
    shareImage: share.url ? { url: share.url, width: share.width, height: share.height } : null,
  };
}

/**
 * Everything a listed page needs from `generateMetadata`. A page that wants
 * more — the blog index adding nothing today, a future page adding a feed —
 * spreads this and adds to it.
 */
export async function pageMetadata(path: string): Promise<Metadata> {
  const { page, settings, title, description, shareImage } = await resolvePage(path);

  return {
    title,
    description: description || undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description: description || undefined,
      url: path,
      siteName: settings.siteName,
      images: shareImage
        ? [
            {
              url: shareImage.url,
              ...(shareImage.width && shareImage.height
                ? { width: shareImage.width, height: shareImage.height }
                : {}),
            },
          ]
        : undefined,
    },
    // Only said when it is true. Saying `index: true` everywhere else would add
    // a tag that means nothing — indexing is the default — and invites somebody
    // to "fix" it later by inverting it.
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * The defaults in the root layout: the browser-tab icon, and the title and
 * description inherited by any page that sets none of its own.
 *
 * The favicon is set here rather than by dropping a file in `app/`, because the
 * whole point is that an editor can change it without a deploy. `public/favicon.ico`
 * is still served at its usual address and is what browsers fall back to.
 */
export async function siteMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.defaultMetaTitle ?? DEFAULT_SITE_SETTINGS.defaultMetaTitle ?? settings.siteName,
    description:
      settings.defaultMetaDescription ?? DEFAULT_SITE_SETTINGS.defaultMetaDescription ?? undefined,
    icons: { icon: settings.favicon.url ?? "/favicon.ico" },
  };
}
