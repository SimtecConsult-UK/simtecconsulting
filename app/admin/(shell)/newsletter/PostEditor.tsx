"use client";

import { useState } from "react";
import Link from "next/link";
import { CharCount } from "../../CharCount";
import { Banners, DeleteFooter, FilePicker, TextAreaField, TextField } from "../../EditorUI";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { BodyEditor } from "./BodyEditor";
import { deletePost, savePost, type PostInput } from "./actions";
import { LIMITS, postTooLong } from "./limits";
import { blocksLength } from "../../../lib/blog/html";
import { slugify } from "../../../lib/blog/slug";
import { SITE_URL } from "../../../lib/sections";
import { BUCKETS } from "../../../lib/supabase/storage";
import { uploadImage } from "../../upload";
import type { BlogBlock, FaqPair } from "../../../lib/blog/types";
import type { EditablePost } from "./data";

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
  const [uploading, setUploading] = useState(false);

  const bodyCount = blocksLength(draft.body);
  const slug = slugify(draft.slug || draft.title);

  /** The same sentence the server would send back, so Save explains itself. */
  const tooLong = postTooLong(draft, bodyCount);

  const submit = (next: "draft" | "published") => {
    save(
      () => savePost({ ...draft, status: next, slug }),
      () => setDraft((current) => ({ ...current, status: next }))
    );
  };

  const onCover = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(BUCKETS.blogImages, "covers", file);
      if (!result.ok) {
        setError(`That cover did not upload: ${result.error}`);
        return;
      }
      patch({
        coverPath: result.path,
        coverWidth: result.width,
        coverHeight: result.height,
      });
      setCoverUrl(result.url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That cover could not be read.");
    } finally {
      setUploading(false);
    }
  };

  const setFaq = (index: number, fields: Partial<FaqPair>) => {
    set(
      "faqs",
      draft.faqs.map((pair, i) => (i === index ? { ...pair, ...fields } : pair))
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
        {coverUrl ? (
          <>
            <div className="cms-preview">
              {/* A plain img: this is a private tool and the file has just been
                  uploaded, so there is nothing for next/image to optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="" />
            </div>
            <div className="cms-file-row">
              <FilePicker
                accept="image/*"
                disabled={uploading}
                onPick={onCover}
                className="cms-btn cms-btn--secondary"
              >
                Replace
              </FilePicker>
              <button
                type="button"
                className="cms-btn cms-btn--danger"
                onClick={() => {
                  patch({ coverPath: null, coverWidth: null, coverHeight: null });
                  setCoverUrl(null);
                }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <FilePicker accept="image/*" disabled={uploading} onPick={onCover}>
            <span>{uploading ? "Uploading…" : "Choose a cover image · 1600×900"}</span>
            <span className="cms-mono">JPG, PNG or WebP</span>
          </FilePicker>
        )}

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
          <div style={{ borderTop: "1px solid var(--cms-line-soft)", padding: 22, display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span className="cms-h" style={{ fontSize: 15, fontWeight: 600 }}>Search listing</span>

              <label className="cms-field">
                <span className="cms-label">Web address</span>
                <div style={{ display: "flex", alignItems: "center", background: "var(--cms-field)", border: "1px solid var(--cms-field-line)", borderRadius: 8, padding: "10px 12px" }}>
                  <span className="cms-mono" style={{ fontSize: 13 }}>/blog/</span>
                  <input
                    className="cms-mono"
                    style={{ fontSize: 13, color: "var(--cms-ink)", background: "none", border: 0, padding: 0, flex: 1, minWidth: 0 }}
                    value={draft.slug}
                    onChange={(event) => set("slug", event.target.value)}
                    placeholder={slugify(draft.title) || "from-the-title"}
                  />
                </div>
              </label>

              <TextField
                label="Meta title"
                value={draft.metaTitle}
                limit={LIMITS.metaTitle}
                placeholder="Defaults to the post title"
                onChange={(value) => set("metaTitle", value)}
              />

              <TextAreaField
                label="Meta description"
                value={draft.metaDescription}
                limit={LIMITS.metaDescription}
                placeholder="Defaults to the standfirst"
                onChange={(value) => set("metaDescription", value)}
              />

              <div className="cms-subcard" style={{ gap: 5 }}>
                <span className="cms-mono">{SITE_URL.replace(/^https?:\/\//, "")}/blog/{slug || "…"}</span>
                <span style={{ fontSize: 16, color: "#1a4fd6" }}>{draft.metaTitle || draft.title || "Post title"}</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "#5b6766" }}>
                  {draft.metaDescription || draft.standfirst || "The standfirst appears here."}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, borderTop: "1px solid var(--cms-line-soft)", paddingTop: 22 }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span className="cms-h" style={{ fontSize: 15, fontWeight: 600 }}>Answer content</span>
                <span className="cms-help">
                  What AI assistants quote. Name Simtec, the service and the standard in the first
                  paragraph rather than &ldquo;we&rdquo;, and phrase headings as questions.
                </span>
              </span>

              <TextAreaField
                label="Key takeaway"
                value={draft.keyTakeaway}
                limit={LIMITS.keyTakeaway}
                placeholder="State the answer plainly in one or two sentences."
                onChange={(value) => set("keyTakeaway", value)}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="cms-label">FAQ pairs</span>
                {draft.faqs.map((pair, index) => (
                  <div key={index} className="cms-subcard">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <label className="cms-field" style={{ flex: 1, minWidth: 0 }}>
                        <span className="cms-label">Question</span>
                        <input
                          className="cms-input"
                          style={{ background: "#fff", fontWeight: 600 }}
                          value={pair.q}
                          onChange={(event) => setFaq(index, { q: event.target.value })}
                          placeholder="How long does a re-validation take?"
                        />
                      </label>
                      <button
                        type="button"
                        className="cms-link-btn"
                        style={{ marginTop: 24 }}
                        onClick={() => set("faqs", draft.faqs.filter((_, i) => i !== index))}
                      >
                        Remove
                      </button>
                    </div>
                    <label className="cms-field">
                      <span className="cms-label">Answer</span>
                      <textarea
                        className="cms-textarea"
                        style={{ background: "#fff" }}
                        rows={2}
                        value={pair.a}
                        onChange={(event) => setFaq(index, { a: event.target.value })}
                        placeholder="Two or three sentences, stated plainly."
                      />
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  className="cms-btn cms-btn--secondary"
                  style={{ alignSelf: "flex-start", borderStyle: "dashed", color: "var(--cms-teal)" }}
                  onClick={() => set("faqs", [...draft.faqs, { q: "", a: "" }])}
                >
                  Add question
                </button>
              </div>

              <label className="cms-field" style={{ maxWidth: 260 }}>
                <span className="cms-label">Schema type</span>
                <select
                  className="cms-select"
                  value={draft.schemaType}
                  onChange={(event) => set("schemaType", event.target.value as PostInput["schemaType"])}
                >
                  <option value="Article">Article</option>
                  <option value="NewsArticle">NewsArticle</option>
                  <option value="HowTo">HowTo</option>
                </select>
              </label>
            </div>
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
