"use client";

import { TextAreaField, TextField } from "./EditorUI";
import { SEO_LIMITS } from "./validation";
import type { FaqPair } from "../lib/blog/types";

/**
 * The "Search & AI visibility" fields, shared by the newsletter editor and the
 * site's own pages.
 *
 * They were written for a post first. A page is described to Google and to an
 * AI assistant in exactly the same terms — a title, a description, a plainly
 * stated answer and some questions — so rather than a second copy drifting out
 * of step with the first, both editors draw these.
 *
 * What differs between the two is passed in: the web address (a post's is
 * editable, a page's is fixed), what the fields fall back to, and which
 * schema.org types are on offer.
 */

/** A titled group of fields, separated from the one above it by a rule. */
export function SeoGroup({
  heading,
  help,
  first,
  children,
}: {
  heading: string;
  help?: React.ReactNode;
  /** The first group in a panel has no rule above it. */
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        ...(first ? {} : { borderTop: "1px solid var(--cms-line-soft)", paddingTop: 22 }),
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span className="cms-h" style={{ fontSize: 15, fontWeight: 600 }}>
          {heading}
        </span>
        {help && <span className="cms-help">{help}</span>}
      </span>
      {children}
    </div>
  );
}

/** A mock-up of the Google result, drawn from whatever is in the fields. */
export function SearchPreview({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description: string;
}) {
  return (
    <div className="cms-subcard" style={{ gap: 5 }}>
      <span className="cms-mono">{url}</span>
      <span style={{ fontSize: 16, color: "#1a4fd6" }}>{title}</span>
      <span style={{ fontSize: 13, lineHeight: 1.6, color: "#5b6766" }}>{description}</span>
    </div>
  );
}

/**
 * The web address, as a read-only path or an editable slug behind a fixed
 * prefix. Both SEO panels show one; only the newsletter's can be typed in.
 */
function AddressField({
  prefix,
  slug,
  help,
}: {
  prefix: string;
  /** Omit to show the prefix alone, as a page whose address is fixed. */
  slug?: { value: string; placeholder: string; onChange: (value: string) => void };
  help?: string;
}) {
  return (
    <label className="cms-field">
      <span className="cms-label">Web address</span>
      <div className="cms-addr">
        <span className="cms-mono cms-addr-prefix">{prefix}</span>
        {slug && (
          <input
            className="cms-mono cms-addr-input"
            value={slug.value}
            onChange={(event) => slug.onChange(event.target.value)}
            placeholder={slug.placeholder}
          />
        )}
      </div>
      {help && <span className="cms-help">{help}</span>}
    </label>
  );
}

/** The search listing: what the result in Google says, and a preview of it. */
export function SearchListingFields({
  addressPrefix,
  slug,
  addressHelp,
  metaTitle,
  metaDescription,
  titleFallback,
  descriptionFallback,
  titlePlaceholder,
  descriptionPlaceholder,
  previewUrl,
  onMetaTitle,
  onMetaDescription,
}: {
  /** "/blog/" for a post, the page's whole address for a page. */
  addressPrefix: string;
  slug?: { value: string; placeholder: string; onChange: (value: string) => void };
  addressHelp?: string;
  metaTitle: string;
  metaDescription: string;
  /** What the preview shows, and what the live page says, while this is empty. */
  titleFallback: string;
  descriptionFallback: string;
  /** The greyed hint in the field itself, when it should read as an instruction
      ("Defaults to the post title") rather than repeat the fallback. */
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  previewUrl: string;
  onMetaTitle: (value: string) => void;
  onMetaDescription: (value: string) => void;
}) {
  return (
    <SeoGroup heading="Search listing" first>
      <AddressField prefix={addressPrefix} slug={slug} help={addressHelp} />

      <TextField
        label="Meta title"
        value={metaTitle}
        limit={SEO_LIMITS.metaTitle}
        placeholder={titlePlaceholder ?? titleFallback}
        onChange={onMetaTitle}
      />

      <TextAreaField
        label="Meta description"
        value={metaDescription}
        limit={SEO_LIMITS.metaDescription}
        placeholder={descriptionPlaceholder ?? descriptionFallback}
        onChange={onMetaDescription}
      />

      <SearchPreview
        url={previewUrl}
        title={metaTitle || titleFallback}
        description={metaDescription || descriptionFallback}
      />
    </SeoGroup>
  );
}

/** The question-and-answer pairs, as a list you add to and remove from. */
export function FaqEditor({
  faqs,
  onChange,
  questionPlaceholder = "How long does a re-validation take?",
}: {
  faqs: FaqPair[];
  onChange: (faqs: FaqPair[]) => void;
  questionPlaceholder?: string;
}) {
  const setPair = (index: number, fields: Partial<FaqPair>) =>
    onChange(faqs.map((pair, i) => (i === index ? { ...pair, ...fields } : pair)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="cms-label">FAQ pairs</span>
      {faqs.map((pair, index) => (
        <div key={index} className="cms-subcard">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <label className="cms-field" style={{ flex: 1, minWidth: 0 }}>
              <span className="cms-label">Question</span>
              <input
                className="cms-input"
                style={{ background: "#fff", fontWeight: 600 }}
                value={pair.q}
                onChange={(event) => setPair(index, { q: event.target.value })}
                placeholder={questionPlaceholder}
              />
            </label>
            <button
              type="button"
              className="cms-link-btn"
              style={{ marginTop: 24 }}
              onClick={() => onChange(faqs.filter((_, i) => i !== index))}
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
              onChange={(event) => setPair(index, { a: event.target.value })}
              placeholder="Two or three sentences, stated plainly."
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className="cms-btn cms-btn--secondary cms-btn--add"
        onClick={() => onChange([...faqs, { q: "", a: "" }])}
      >
        Add question
      </button>
    </div>
  );
}

/**
 * The half of the panel that no reader sees: the plain answer and the questions
 * an AI assistant quotes, plus what kind of thing this page or post is.
 */
export function AnswerContentFields<T extends string>({
  keyTakeaway,
  onKeyTakeaway,
  takeawayPlaceholder = "State the answer plainly in one or two sentences.",
  faqs,
  onFaqs,
  schemaType,
  schemaOptions,
  onSchemaType,
  help = (
    <>
      What AI assistants quote. Name Simtec, the service and the standard in the first paragraph
      rather than &ldquo;we&rdquo;, and phrase headings as questions.
    </>
  ),
}: {
  keyTakeaway: string;
  onKeyTakeaway: (value: string) => void;
  takeawayPlaceholder?: string;
  faqs: FaqPair[];
  onFaqs: (faqs: FaqPair[]) => void;
  schemaType: T;
  schemaOptions: { value: T; label: string }[];
  onSchemaType: (value: T) => void;
  help?: React.ReactNode;
}) {
  return (
    <SeoGroup heading="Answer content" help={help}>
      <TextAreaField
        label="Key takeaway"
        value={keyTakeaway}
        limit={SEO_LIMITS.keyTakeaway}
        placeholder={takeawayPlaceholder}
        onChange={onKeyTakeaway}
      />

      <FaqEditor faqs={faqs} onChange={onFaqs} />

      <label className="cms-field" style={{ maxWidth: 260 }}>
        <span className="cms-label">Schema type</span>
        <select
          className="cms-select"
          value={schemaType}
          onChange={(event) => onSchemaType(event.target.value as T)}
        >
          {schemaOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </SeoGroup>
  );
}
