"use client";

import { useState } from "react";
import Link from "next/link";
import { Banners, DeleteFooter, ImageField } from "../../EditorUI";
import { AnswerContentFields, SearchListingFields, SeoGroup } from "../../SeoFields";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { useImageUpload } from "../../useImageUpload";
import { SITE_HOST } from "../../../lib/sections";
import { BUCKETS } from "../../../lib/supabase/storage";
import { PAGE_SCHEMA_TYPES, blankPageSeo, type PageSeo } from "../../../lib/seo/types";
import type { SeoPage } from "../../../lib/seo/pages";
import { resetPageSeo, savePageSeo, type PageSeoInput } from "./actions";
import { pageTooLong } from "./limits";

/**
 * One page's search and AI settings.
 *
 * Everything here is optional. A field left empty is not a gap — it means the
 * page keeps the wording it already ships with, which is shown greyed out in
 * the field and in the preview, so an editor can always see what the live page
 * says without having to retype it.
 */

function toInput(page: SeoPage, seo: PageSeo): PageSeoInput {
  return {
    path: page.path,
    metaTitle: seo.metaTitle ?? "",
    metaDescription: seo.metaDescription ?? "",
    shareImagePath: seo.shareImage.path,
    shareImageWidth: seo.shareImage.width,
    shareImageHeight: seo.shareImage.height,
    keyTakeaway: seo.keyTakeaway ?? "",
    faqs: seo.faqs,
    schemaType: seo.schemaType,
    noindex: seo.noindex,
  };
}

/** What the form reads as once Reset has thrown the stored row away. */
function blank(page: SeoPage): PageSeoInput {
  return toInput(page, blankPageSeo(page.path, page.defaultSchemaType));
}

export function PageSeoEditor({
  page,
  seo,
  /** The site-wide picture, shown when this page has none of its own. */
  fallbackShareUrl,
}: {
  page: SeoPage;
  seo: PageSeo;
  fallbackShareUrl: string | null;
}) {
  const {
    draft,
    setDraft,
    set,
    patch,
    status,
    error,
    setError,
    pending,
    confirmDelete,
    save,
    remove,
  } = useEditorDraft<PageSeoInput>(toInput(page, seo));

  const [shareUrl, setShareUrl] = useState<string | null>(seo.shareImage.url);

  const tooLong = pageTooLong(draft);

  const share = useImageUpload({
    bucket: BUCKETS.siteAssets,
    folder: "share",
    noun: "picture",
    onError: setError,
    onUploaded: ({ path, width, height, url }) => {
      patch({ shareImagePath: path, shareImageWidth: width, shareImageHeight: height });
      setShareUrl(url);
    },
  });

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/seo" className="cms-link-btn">
        ← All pages
      </Link>

      <div className="cms-editor-head">
        <h1 className="cms-h" style={{ fontSize: 30 }}>{page.name}</h1>

        <div className="cms-editor-head-row">
          <span className="cms-mono">{statusLabel(status, `Live at ${page.path}`)}</span>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href={page.path} target="_blank" className="cms-link-btn">
              View page
            </Link>
            <button
              type="button"
              className="cms-btn cms-btn--primary"
              onClick={() => save(() => savePageSeo(draft))}
              disabled={pending || tooLong !== null}
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <Banners
        error={error}
        saved={status === "saved"}
        savedMessage="Saved. The live page has been updated."
        warning={tooLong}
      />

      <p className="cms-help">{page.blurb}</p>

      <div className="cms-editor cms-editor-body">
        <SearchListingFields
          addressPrefix={`${SITE_HOST}${page.path}`}
          addressHelp="Fixed — this is a page of the site, not a post, so its address is part of the build."
          metaTitle={draft.metaTitle}
          metaDescription={draft.metaDescription}
          titleFallback={page.fallbackTitle}
          descriptionFallback={page.fallbackDescription}
          previewUrl={`${SITE_HOST}${page.path === "/" ? "" : page.path}`}
          onMetaTitle={(value) => set("metaTitle", value)}
          onMetaDescription={(value) => set("metaDescription", value)}
        />

        <SeoGroup
          heading="Share picture"
          help="The picture shown when somebody posts this page on LinkedIn or sends it in a chat. Without one the page uses the site-wide picture. 1200×630 is the size every platform crops cleanly."
        >
          <ImageField
            url={shareUrl}
            fallbackUrl={fallbackShareUrl}
            uploading={share.uploading}
            choose="Choose a share picture · 1200×630"
            hint={fallbackShareUrl ? "Currently using the site-wide picture" : "JPG, PNG or WebP"}
            onPick={share.pick}
            onRemove={() => {
              patch({ shareImagePath: null, shareImageWidth: null, shareImageHeight: null });
              setShareUrl(null);
            }}
          />
        </SeoGroup>

        <AnswerContentFields
          keyTakeaway={draft.keyTakeaway}
          onKeyTakeaway={(value) => set("keyTakeaway", value)}
          takeawayPlaceholder="In one or two sentences, what is the plain answer this page gives?"
          faqs={draft.faqs}
          onFaqs={(faqs) => set("faqs", faqs)}
          schemaType={draft.schemaType}
          schemaOptions={PAGE_SCHEMA_TYPES}
          onSchemaType={(value) => set("schemaType", value)}
          help={
            <>
              What AI assistants quote when somebody asks about this page. Answer plainly, name
              Simtec rather than &ldquo;we&rdquo;, and write the questions the way a customer would
              ask them.
            </>
          }
        />

        <SeoGroup heading="Search visibility">
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={draft.noindex}
              onChange={(event) => set("noindex", event.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="cms-label">Hide this page from search engines</span>
              <span className="cms-help">
                The page stays on the site and anyone with the link can read it, but Google is
                asked to leave it out of results. Ticking this on the homepage removes the site
                from search.
              </span>
            </span>
          </label>
        </SeoGroup>
      </div>

      <DeleteFooter
        help="Resetting clears everything above and puts the page back to the wording it was built with."
        label="Reset to default"
        confirming={confirmDelete}
        disabled={pending}
        onDelete={() =>
          remove(
            () => resetPageSeo(page.path),
            () => {
              setDraft(blank(page));
              setShareUrl(null);
            }
          )
        }
      />
    </div>
  );
}
