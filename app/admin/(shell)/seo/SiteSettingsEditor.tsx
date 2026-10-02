"use client";

import { useState } from "react";
import Link from "next/link";
import { Banners, FilePicker, ImageField, TextAreaField, TextField } from "../../EditorUI";
import { SeoGroup } from "../../SeoFields";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { useImageUpload } from "../../useImageUpload";
import { uploadFile } from "../../upload";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import type { SiteSettings } from "../../../lib/seo/types";
import { saveSiteSettings, type SiteSettingsInput } from "./actions";
import { LIMITS, siteTooLong } from "./limits";

/**
 * The settings that belong to the whole site rather than to any one page: the
 * browser-tab icon, the picture a share falls back to, and who the company is.
 *
 * That last part is the half an AI assistant reads. It is written into every
 * page's structured data as the publisher, and onto the homepage as the
 * company's own entry, which is what an assistant quotes when somebody asks
 * what Simtec does.
 */

/** A favicon is a tiny file and is often an .ico or an .svg, not a photograph. */
const FAVICON_ACCEPT = "image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico";

function toInput(settings: SiteSettings): SiteSettingsInput {
  return {
    siteName: settings.siteName,
    defaultMetaTitle: settings.defaultMetaTitle ?? "",
    defaultMetaDescription: settings.defaultMetaDescription ?? "",
    faviconPath: settings.favicon.path,
    socialImagePath: settings.socialImage.path,
    socialImageWidth: settings.socialImage.width,
    socialImageHeight: settings.socialImage.height,
    orgLegalName: settings.orgLegalName ?? "",
    orgDescription: settings.orgDescription ?? "",
    orgSameAs: settings.orgSameAs,
  };
}

export function SiteSettingsEditor({ settings }: { settings: SiteSettings }) {
  const { draft, set, patch, status, error, setError, pending, save } =
    useEditorDraft<SiteSettingsInput>(toInput(settings));

  const [faviconUrl, setFaviconUrl] = useState<string | null>(settings.favicon.url);
  const [socialUrl, setSocialUrl] = useState<string | null>(settings.socialImage.url);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const tooLong = siteTooLong(draft);

  const social = useImageUpload({
    bucket: BUCKETS.siteAssets,
    folder: "share",
    noun: "picture",
    onError: setError,
    onUploaded: ({ path, width, height, url }) => {
      patch({ socialImagePath: path, socialImageWidth: width, socialImageHeight: height });
      setSocialUrl(url);
    },
  });

  /**
   * The favicon does not go through `useImageUpload`: nothing stores its
   * dimensions, and measuring one in the browser would reject the .ico and
   * .svg files that are the normal way to supply it.
   */
  const onFavicon = async (file: File) => {
    setUploadingFavicon(true);
    setError(null);
    try {
      const result = await uploadFile(BUCKETS.siteAssets, "favicon", file);
      if (!result.ok) {
        setError(`That icon did not upload: ${result.error}`);
        return;
      }
      set("faviconPath", result.path);
      setFaviconUrl(publicUrl(BUCKETS.siteAssets, result.path));
    } catch (problem) {
      // Without this the button sits on "Uploading…" for ever and says nothing:
      // uploading needs crypto.randomUUID(), which the browser withholds from a
      // page served over plain http, so it throws before the upload is tried.
      setError(problem instanceof Error ? problem.message : "That icon could not be uploaded.");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const setLink = (index: number, value: string) =>
    set(
      "orgSameAs",
      draft.orgSameAs.map((url, i) => (i === index ? value : url))
    );

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/seo" className="cms-link-btn">
        ← All pages
      </Link>

      <div className="cms-editor-head">
        <h1 className="cms-h" style={{ fontSize: 30 }}>Site-wide</h1>

        <div className="cms-editor-head-row">
          <span className="cms-mono">{statusLabel(status, "Applies to every page")}</span>
          <button
            type="button"
            className="cms-btn cms-btn--primary"
            onClick={() => save(() => saveSiteSettings(draft))}
            disabled={pending || tooLong !== null}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <Banners
        error={error}
        saved={status === "saved"}
        savedMessage="Saved. Every page on the site has been updated."
        warning={tooLong}
      />

      <div className="cms-editor cms-editor-body">
        <SeoGroup
          heading="Browser tab icon"
          first
          help="The small square beside the page name in a browser tab, a bookmark and a phone home screen. A square PNG of at least 180×180, an .ico or an .svg."
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              className="cms-row-thumb"
              style={{ width: 64, height: 64, flex: "0 0 auto", borderRadius: 12 }}
            >
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconUrl} alt="" style={{ objectFit: "contain", padding: 10 }} />
              ) : (
                "NONE"
              )}
            </span>
            <div className="cms-file-row" style={{ margin: 0 }}>
              <FilePicker
                accept={FAVICON_ACCEPT}
                disabled={uploadingFavicon}
                onPick={onFavicon}
                className="cms-btn cms-btn--secondary"
              >
                {uploadingFavicon ? "Uploading…" : faviconUrl ? "Replace" : "Choose an icon"}
              </FilePicker>
              {faviconUrl && (
                <button
                  type="button"
                  className="cms-btn cms-btn--danger"
                  onClick={() => {
                    set("faviconPath", null);
                    setFaviconUrl(null);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <span className="cms-help">
            With no icon chosen the site serves the one built into it. Browsers cache this one
            hard — expect to see your own change after a refresh or two.
          </span>
        </SeoGroup>

        <SeoGroup
          heading="Default share picture"
          help="Used when a page is posted on LinkedIn or sent in a chat and has no picture of its own. 1200×630 is the size every platform crops cleanly."
        >
          <ImageField
            url={socialUrl}
            uploading={social.uploading}
            choose="Choose a share picture · 1200×630"
            hint="JPG, PNG or WebP"
            onPick={social.pick}
            onRemove={() => {
              patch({ socialImagePath: null, socialImageWidth: null, socialImageHeight: null });
              setSocialUrl(null);
            }}
          />
        </SeoGroup>

        <SeoGroup
          heading="Default wording"
          help="What a page says about itself when nothing has been written for it. The four pages listed under SEO & AI each have their own wording, so this covers anything else."
        >
          <TextField
            label="Site name"
            value={draft.siteName}
            limit={LIMITS.siteName}
            help="How the company is named in structured data and when a page is shared. Page titles are set per page below."
            onChange={(value) => set("siteName", value)}
          />
          <TextField
            label="Default title"
            value={draft.defaultMetaTitle}
            limit={LIMITS.metaTitle}
            placeholder="Simtec — Construction management software"
            onChange={(value) => set("defaultMetaTitle", value)}
          />
          <TextAreaField
            label="Default description"
            value={draft.defaultMetaDescription}
            limit={LIMITS.metaDescription}
            placeholder="One or two sentences describing the company."
            onChange={(value) => set("defaultMetaDescription", value)}
          />
        </SeoGroup>

        <SeoGroup
          heading="Who Simtec is"
          help="Written into every page in the machine-readable form search engines and AI assistants read. This is what an assistant repeats when somebody asks it what the company does."
        >
          <TextField
            label="Registered company name"
            value={draft.orgLegalName}
            limit={LIMITS.orgLegalName}
            placeholder="Simtec Consult Ltd"
            onChange={(value) => set("orgLegalName", value)}
          />
          <TextAreaField
            label="What the company does"
            value={draft.orgDescription}
            limit={LIMITS.orgDescription}
            rows={3}
            placeholder="Two or three sentences, stated plainly and without marketing language."
            onChange={(value) => set("orgDescription", value)}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span className="cms-label">Official profiles</span>
            <span className="cms-help">
              LinkedIn, Companies House, anywhere else the company is listed under its own name.
              These tell a search engine that those accounts and this website are the same company.
            </span>
            {draft.orgSameAs.map((url, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  className="cms-input"
                  value={url}
                  onChange={(event) => setLink(index, event.target.value)}
                  placeholder="https://www.linkedin.com/company/…"
                />
                <button
                  type="button"
                  className="cms-link-btn"
                  onClick={() =>
                    set("orgSameAs", draft.orgSameAs.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="cms-btn cms-btn--secondary cms-btn--add"
              onClick={() => set("orgSameAs", [...draft.orgSameAs, ""])}
            >
              Add a profile
            </button>
          </div>
        </SeoGroup>
      </div>
    </div>
  );
}
