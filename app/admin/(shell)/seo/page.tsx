import Link from "next/link";
import { Chevron } from "../../icons";
import { SEO_PAGES } from "../../../lib/seo/pages";
import { getSiteSettingsForEdit, listPageSeo } from "./data";

/**
 * The SEO & AI section's front page: the site-wide settings, then one row per
 * public page. Each row says what that page currently tells Google, and whether
 * that wording was written here or is the one the page shipped with.
 */

export default async function SeoIndexPage() {
  const [settings, stored] = await Promise.all([getSiteSettingsForEdit(), listPageSeo()]);

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <h1 className="cms-h">SEO &amp; AI</h1>
          <p>
            What the website tells search engines and AI assistants about itself. Newsletter posts
            carry their own panel inside each post.
          </p>
        </div>
      </div>

      <div className="cms-rows">
        <Link href="/admin/seo/site" className="cms-row">
          <span className="cms-row-thumb">
            {settings.favicon.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.favicon.url} alt="" style={{ objectFit: "contain", padding: 14 }} />
            ) : (
              "NO ICON"
            )}
          </span>
          <span className="cms-row-body">
            <span style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
              <span className="cms-row-title">Site-wide</span>
              <span className="cms-chip">Every page</span>
            </span>
            <span className="cms-row-meta">
              Favicon · share picture · who Simtec is
            </span>
          </span>
          <Chevron />
        </Link>

        {SEO_PAGES.map((page) => {
          const saved = stored.get(page.path);
          // Every way a page can differ from what it was built with, not just
          // the wording: a row that only carries a share picture, or only the
          // tick that hides the page, is still a page somebody has changed.
          const customised = Boolean(
            saved &&
              (saved.metaTitle ||
                saved.metaDescription ||
                saved.keyTakeaway ||
                saved.faqs.length > 0 ||
                saved.shareImage.path ||
                saved.noindex ||
                saved.schemaType !== page.defaultSchemaType)
          );

          return (
            <Link key={page.id} href={`/admin/seo/${page.id}`} className="cms-row">
              <span className="cms-row-thumb">
                {saved?.shareImage.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={saved.shareImage.url} alt="" />
                ) : (
                  page.path
                )}
              </span>
              <span className="cms-row-body">
                <span style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                  <span className="cms-row-title">{page.name}</span>
                  <span className={`cms-chip${customised ? " cms-chip--live" : ""}`}>
                    {customised ? "Customised" : "Default"}
                  </span>
                  {saved?.noindex && <span className="cms-chip">Hidden from search</span>}
                </span>
                <span className="cms-row-meta">
                  {saved?.metaTitle ?? page.fallbackTitle}
                </span>
              </span>
              <Chevron />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
