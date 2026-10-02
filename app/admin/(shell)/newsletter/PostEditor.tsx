"use client";

import { useState } from "react";
import Link from "next/link";
import { CharCount } from "../../CharCount";
import { Banners, DeleteFooter, ImageField } from "../../EditorUI";
import { AnswerContentFields, SearchListingFields } from "../../SeoFields";
import { useImageUpload } from "../../useImageUpload";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { BodyEditor } from "./BodyEditor";
import { deletePost, savePost, type PostInput } from "./actions";
import { LIMITS, postTooLong } from "./limits";
import { blocksLength } from "../../../lib/blog/html";
import { slugify } from "../../../lib/blog/slug";
import { SITE_HOST } from "../../../lib/sections";
import { BUCKETS } from "../../../lib/supabase/storage";
import type { BlogBlock } from "../../../lib/blog/types";
import type { EditablePost } from "./data";

/** The three kinds of thing a newsletter post can be, in schema.org's terms. */
const SCHEMA_OPTIONS: { value: PostInput["schemaType"]; label: string }[] = [
  { value: "Article", label: "Article" },
  { value: "NewsArticle", label: "NewsArticle" },
  { value: "HowTo", label: "HowTo" },
];

type PostEditorProps = {
  /** null when writing a new post. */
  post: EditablePost | null;
};

const BLANK: PostInput = {
  id: null,
  slug: "",
  title: "",
  standfirst: "",
  body: [],
  coverPath: null,
  coverAlt: "",
  coverWidth: null,
  coverHeight: null,
  status: "draft",
  publishedAt: null,
  metaTitle: "",
  metaDescription: "",
  keyTakeaway: "",
  faqs: [],
  schemaType: "Article",
};

function fromPost(post: EditablePost): PostInput {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    standfirst: post.standfirst,
    body: post.body,
    coverPath: post.cover.path,
    coverAlt: post.cover.alt,
    coverWidth: post.cover.width,
    coverHeight: post.cover.height,
    status: post.status,
    publishedAt: post.publishedAt || null,
    metaTitle: post.seo.metaTitle ?? "",
    metaDescription: post.seo.metaDescription ?? "",
    keyTakeaway: post.seo.keyTakeaway ?? "",
    faqs: post.seo.faqs,
    schemaType: post.seo.schemaType,
  };
}

export function PostEditor({ post }: PostEditorProps) {
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
  } = useEditorDraft<PostInput>(post ? fromPost(post) : BLANK);

  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover.url ?? null);
  const [seoOpen, setSeoOpen] = useState(false);

  const bodyCount = blocksLength(draft.body);
  const slug = slugify(draft.slug || draft.title);

  /** The same sentence the server would send back, so Save explains itself. */
  const tooLong = postTooLong(draft, bodyCount);

  const cover = useImageUpload({
    bucket: BUCKETS.blogImages,
    folder: "covers",
    noun: "cover",
    onError: setError,
    onUploaded: ({ path, width, height, url }) => {
      patch({ coverPath: path, coverWidth: width, coverHeight: height });
      setCoverUrl(url);
    },
  });

  const submit = (next: "draft" | "published") => {
    save(
      () => savePost({ ...draft, status: next, slug }),
      () => setDraft((current) => ({ ...current, status: next }))
    );
  };

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/newsletter" className="cms-link-btn">
        ← All posts
      </Link>

      <div className="cms-editor-head">
        <input
          className="cms-title-input"
          value={draft.title}
          onChange={(event) => set("title", event.target.value)}
          placeholder="Post title"
          aria-label="Post title"
        />

        <div className="cms-editor-head-row">
          <span className="cms-mono">
            {statusLabel(status, post ? `Live at /blog/${post.slug}` : "Not saved yet")}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CharCount value={draft.title.length} limit={LIMITS.title} />
            <button
              type="button"
              className="cms-btn cms-btn--secondary"
              onClick={() => submit("draft")}
              disabled={pending || tooLong !== null}
            >
              {pending ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              className="cms-btn cms-btn--primary"
              onClick={() => submit("published")}
              disabled={pending || tooLong !== null}
            >
              {draft.status === "published" ? "Update live post" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <Banners
        error={error}
        saved={status === "saved"}
        savedMessage={`Saved. ${
          draft.status === "published"
            ? "The post is live on the site."
            : "It stays a draft until you publish."
        }`}
        warning={tooLong}
      />

      <BodyEditor
        blocks={draft.body}
        onChange={(blocks: BlogBlock[]) => set("body", blocks)}
        over={bodyCount > LIMITS.body}
        count={<CharCount value={bodyCount} limit={LIMITS.body} />}
      />

      <div className="cms-card">
        <div className="cms-field-head">
          <span className="cms-label">Standfirst</span>
          <CharCount value={draft.standfirst.length} limit={LIMITS.standfirst} />
        </div>
        <textarea
          className={`cms-textarea${draft.standfirst.length > LIMITS.standfirst ? " cms-textarea--over" : ""}`}
          rows={2}
          value={draft.standfirst}
          onChange={(event) => set("standfirst", event.target.value)}
          placeholder="One or two sentences for the newsletter index."
        />
        <p className="cms-help">
          Shown under the title on the index, and again as the opening line of the post.
        </p>
      </div>

      <div className="cms-card">
        <span className="cms-label">Cover image</span>
        <ImageField
          url={coverUrl}
          uploading={cover.uploading}
          choose="Choose a cover image · 1600×900"
          hint="JPG, PNG or WebP"
          onPick={cover.pick}
          onRemove={() => {
            patch({ coverPath: null, coverWidth: null, coverHeight: null });
            setCoverUrl(null);
          }}
        />

        <label className="cms-field" style={{ marginTop: 4 }}>
          <span className="cms-label">Alt text</span>
          <input
            className="cms-input"
            value={draft.coverAlt}
            onChange={(event) => set("coverAlt", event.target.value)}
            placeholder="Describe the image for people who cannot see it"
          />
        </label>
      </div>

      <div className="cms-editor">
        <button
          type="button"
          onClick={() => setSeoOpen((open) => !open)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 12,
            padding: "18px 22px",
            background: "none",
            border: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
          aria-expanded={seoOpen}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="cms-label">Search &amp; AI visibility</span>
            <span className="cms-help">
              {draft.metaTitle || draft.metaDescription || draft.faqs.length > 0
                ? "Customised"
                : "Using the title and standfirst"}
            </span>
          </span>
          <span className="cms-mono" style={{ color: "var(--cms-teal)" }}>
            {seoOpen ? "Hide" : "Edit"}
          </span>
        </button>

        {seoOpen && (
          <div className="cms-editor-body" style={{ borderTop: "1px solid var(--cms-line-soft)" }}>
            <SearchListingFields
              addressPrefix="/blog/"
              slug={{
                value: draft.slug,
                placeholder: slugify(draft.title) || "from-the-title",
                onChange: (value) => set("slug", value),
              }}
              metaTitle={draft.metaTitle}
              metaDescription={draft.metaDescription}
              titleFallback={draft.title || "Post title"}
              descriptionFallback={draft.standfirst || "The standfirst appears here."}
              titlePlaceholder="Defaults to the post title"
              descriptionPlaceholder="Defaults to the standfirst"
              previewUrl={`${SITE_HOST}/blog/${slug || "…"}`}
              onMetaTitle={(value) => set("metaTitle", value)}
              onMetaDescription={(value) => set("metaDescription", value)}
            />

            <AnswerContentFields
              keyTakeaway={draft.keyTakeaway}
              onKeyTakeaway={(value) => set("keyTakeaway", value)}
              faqs={draft.faqs}
              onFaqs={(faqs) => set("faqs", faqs)}
              schemaType={draft.schemaType}
              schemaOptions={SCHEMA_OPTIONS}
              onSchemaType={(value) => set("schemaType", value)}
            />
          </div>
        )}
      </div>

      {post && (
        <DeleteFooter
          help="Deleting removes the post from the site. This cannot be undone."
          label="Delete post"
          confirming={confirmDelete}
          disabled={pending}
          onDelete={() => remove(() => deletePost(post.id, post.slug))}
        />
      )}
    </div>
  );
}
