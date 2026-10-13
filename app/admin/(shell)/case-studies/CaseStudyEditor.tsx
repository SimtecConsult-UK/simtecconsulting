"use client";

import { useState } from "react";
import Link from "next/link";
import { CharCount } from "../../CharCount";
import { Banners, DeleteFooter, FilePicker, TextField, VideoField } from "../../EditorUI";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { useVideoUpload } from "../../useVideoUpload";
import { deleteCaseStudy, saveCaseStudy, type CaseStudyInput } from "./actions";
import { LIMITS, caseStudyTooLong, chapterLength } from "./limits";
import type { EditableCaseStudy } from "./data";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { uploadFile, uploadImage } from "../../upload";
import { chapterToText, textToChapter } from "./chapter-text";
import {
  CHAPTERS,
  DEFAULT_CHAPTER,
  EMPTY_CHAPTERS,
  type ChapterKey,
} from "../../../lib/caseStudies";

type Props = {
  caseStudy: EditableCaseStudy | null;
  /** Slot a new case study takes on the homepage. */
  nextPosition: number;
};

export function CaseStudyEditor({ caseStudy, nextPosition }: Props) {
  const initialChapters = caseStudy?.chapters ?? EMPTY_CHAPTERS;

  const {
    draft,
    set,
    patch,
    status,
    error,
    setError,
    pending,
    confirmDelete,
    save,
    remove,
  } = useEditorDraft<CaseStudyInput>(() =>
    caseStudy
      ? {
          id: caseStudy.id,
          position: caseStudy.position,
          tabLabel: caseStudy.tabLabel,
          headline: caseStudy.headline,
          clientName: caseStudy.clientName,
          systemName: caseStudy.systemName,
          projectType: caseStudy.projectType,
          logoPath: caseStudy.logo.path,
          logoWidth: caseStudy.logo.width,
          logoHeight: caseStudy.logo.height,
          videoPath: caseStudy.video.path,
          posterPath: caseStudy.poster.path,
          quote: caseStudy.quote,
          quoteAttribution: caseStudy.quoteAttribution,
          quotePhotoPath: caseStudy.quotePhoto.path,
          chapters: initialChapters,
        }
      : {
          id: null,
          position: nextPosition,
          tabLabel: "",
          headline: "",
          clientName: "",
          systemName: "",
          projectType: "",
          logoPath: null,
          logoWidth: null,
          logoHeight: null,
          videoPath: null,
          posterPath: null,
          quote: "",
          quoteAttribution: "",
          quotePhotoPath: null,
          chapters: initialChapters,
        }
  );

  const [logoUrl, setLogoUrl] = useState(caseStudy?.logo.url ?? null);
  const [posterUrl, setPosterUrl] = useState(caseStudy?.poster.url ?? null);
  const [quotePhotoUrl, setQuotePhotoUrl] = useState(caseStudy?.quotePhoto.url ?? null);
  const [tab, setTab] = useState<ChapterKey>(DEFAULT_CHAPTER);
  const [busy, setBusy] = useState<string | null>(null);

  const video = useVideoUpload({
    bucket: BUCKETS.caseStudyMedia,
    folder: "videos",
    onError: setError,
    onUploaded: (path) => set("videoPath", path),
  });

  // Derived, not held: the preview is always the public URL of what is stored.
  const videoUrl = publicUrl(BUCKETS.caseStudyMedia, draft.videoPath);

  /** True while any upload on the page is running — they share the pickers. */
  const uploading = busy !== null || video.uploading;

  /**
   * What is actually in the box, per chapter, kept exactly as typed.
   *
   * The stored chapter is derived from it rather than the other way round.
   * Feeding the parsed version back into the box would rewrite the text under
   * the cursor on every keystroke, which swallowed trailing spaces and made it
   * impossible to press Enter at all.
   */
  const [chapterText, setChapterText] = useState<Record<ChapterKey, string>>(
    () =>
      Object.fromEntries(
        CHAPTERS.map(({ key }) => [key, chapterToText(initialChapters[key])])
      ) as Record<ChapterKey, string>
  );

  const onChapterText = (value: string) => {
    setChapterText((current) => ({ ...current, [tab]: value }));
    set("chapters", { ...draft.chapters, [tab]: textToChapter(value) });
  };

  /** The same sentence the server would send back, so Save explains itself. */
  const tooLong = caseStudyTooLong(draft);

  const onLogo = async (file: File) => {
    setBusy("logo");
    setError(null);
    try {
      const result = await uploadImage(BUCKETS.caseStudyMedia, "logos", file);
      if (!result.ok) {
        setError(`That logo did not upload: ${result.error}`);
        return;
      }
      patch({
        logoPath: result.path,
        logoWidth: result.width,
        logoHeight: result.height,
      });
      setLogoUrl(result.url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That logo could not be read.");
    } finally {
      setBusy(null);
    }
  };

  const onPoster = async (file: File) => {
    setBusy("poster");
    setError(null);
    const result = await uploadFile(BUCKETS.caseStudyMedia, "posters", file);
    setBusy(null);
    if (!result.ok) {
      setError(`That poster did not upload: ${result.error}`);
      return;
    }
    set("posterPath", result.path);
    setPosterUrl(publicUrl(BUCKETS.caseStudyMedia, result.path));
  };

  const onQuotePhoto = async (file: File) => {
    setBusy("quotePhoto");
    setError(null);
    const result = await uploadFile(BUCKETS.caseStudyMedia, "quote-photos", file);
    setBusy(null);
    if (!result.ok) {
      setError(`That photo did not upload: ${result.error}`);
      return;
    }
    set("quotePhotoPath", result.path);
    setQuotePhotoUrl(publicUrl(BUCKETS.caseStudyMedia, result.path));
  };

  const chapter = draft.chapters[tab];
  const chapterCount = chapterLength(chapter);

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/case-studies" className="cms-link-btn">
        ← All case studies
      </Link>

      <div className="cms-editor-head">
        <input
          className="cms-title-input"
          value={draft.tabLabel}
          onChange={(event) => set("tabLabel", event.target.value)}
          placeholder="Client name"
          aria-label="Client name"
        />
        <div className="cms-editor-head-row">
          <span className="cms-mono">
            {statusLabel(status, `Position ${draft.position} on the homepage`)}
          </span>
          <button
            type="button"
            className="cms-btn cms-btn--primary"
            onClick={() => save(() => saveCaseStudy(draft))}
            disabled={pending || tooLong !== null}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <Banners
        error={error}
        saved={status === "saved"}
        savedMessage="Saved. The homepage shows this straight away."
        warning={tooLong}
      />

      <div className="cms-card">
        <span className="cms-label">Switcher and heading</span>
        <TextField
          label="Client name in the switcher"
          value={draft.tabLabel}
          limit={LIMITS.tabLabel}
          help="Must fit one line on a tablet."
          onChange={(value) => set("tabLabel", value)}
        />
        <TextField
          label="Headline"
          value={draft.headline}
          limit={LIMITS.headline}
          help="Wraps to at most two lines on a laptop."
          onChange={(value) => set("headline", value)}
        />
      </div>

      <div className="cms-card">
        <span className="cms-label">Screen recording</span>
        <VideoField
          url={videoUrl}
          uploading={video.uploading}
          disabled={busy !== null}
          checks={video.checks}
          choose="Choose the screen recording"
          onPick={video.pick}
          onRemove={() => {
            set("videoPath", null);
            video.clearChecks();
          }}
        />

        <p className="cms-help">
          The top-left of the recording is always visible, and phones crop it to 16:10 —
          keep anything important away from the bottom and right edges. It always plays
          without sound.
        </p>
      </div>

      <div className="cms-grid-2">
        <div className="cms-card">
          <span className="cms-label">Logo</span>
          {logoUrl ? (
            <>
              <div className="cms-preview cms-preview--logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="" />
              </div>
              <FilePicker
                accept="image/*"
                disabled={uploading}
                onPick={onLogo}
                className="cms-btn cms-btn--secondary"
              >
                Replace
              </FilePicker>
            </>
          ) : (
            <FilePicker accept="image/*" disabled={uploading} onPick={onLogo}>
              <span>{busy === "logo" ? "Uploading…" : "Choose the client's logo"}</span>
              <span className="cms-mono">SVG or transparent PNG</span>
            </FilePicker>
          )}
          <p className="cms-help">Use the colour version — it sits on white and on pale blue.</p>
        </div>

        <div className="cms-card">
          <span className="cms-label">Poster image</span>
          {posterUrl ? (
            <div className="cms-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl} alt="" />
            </div>
          ) : (
            <FilePicker accept="image/*" disabled={uploading} onPick={onPoster}>
              <span>{busy === "poster" ? "Uploading…" : "Choose a poster image"}</span>
              <span className="cms-mono">1920×1080 JPG or WebP</span>
            </FilePicker>
          )}
          <p className="cms-help">
            Shown before the video plays and to anyone who has asked for less motion.
            Leave it empty to use the first frame.
          </p>
        </div>
      </div>

      <div className="cms-card">
        <span className="cms-label">Client details</span>
        <div className="cms-grid-2">
          <TextField
            label="Client"
            value={draft.clientName}
            limit={LIMITS.clientName}
            onChange={(value) => set("clientName", value)}
          />
          <TextField
            label="System"
            value={draft.systemName}
            limit={LIMITS.systemName}
            onChange={(value) => set("systemName", value)}
          />
        </div>
        <TextField
          label="Project type"
          value={draft.projectType}
          limit={LIMITS.projectType}
          help="Up to three lines on a laptop."
          onChange={(value) => set("projectType", value)}
        />
      </div>

      <div className="cms-card">
        <span className="cms-label">Quote</span>
        <div className="cms-field-head">
          <span className="cms-help">Leave the quote marks out — the design adds them.</span>
          <CharCount value={draft.quote.length} limit={LIMITS.quote} />
        </div>
        <textarea
          className={`cms-textarea${draft.quote.length > LIMITS.quote ? " cms-textarea--over" : ""}`}
          rows={3}
          value={draft.quote}
          onChange={(event) => set("quote", event.target.value)}
        />
        <TextField
          label="Attribution"
          value={draft.quoteAttribution}
          limit={LIMITS.quoteAttribution}
          help={'Shown in capitals, e.g. "Tina Jackson · Compli Digital".'}
          onChange={(value) => set("quoteAttribution", value)}
        />

        <span className="cms-label">Photo of the person quoted</span>
        {quotePhotoUrl ? (
          <>
            <div className="cms-preview cms-preview--face">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={quotePhotoUrl} alt="" />
            </div>
            <div className="cms-file-row">
              <FilePicker
                accept="image/*"
                disabled={uploading}
                onPick={onQuotePhoto}
                className="cms-btn cms-btn--secondary"
              >
                Replace
              </FilePicker>
              <button
                type="button"
                className="cms-btn cms-btn--danger"
                onClick={() => {
                  set("quotePhotoPath", null);
                  setQuotePhotoUrl(null);
                }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <FilePicker accept="image/*" disabled={uploading} onPick={onQuotePhoto}>
            <span>{busy === "quotePhoto" ? "Uploading…" : "Choose a photo"}</span>
            <span className="cms-mono">Square head-and-shoulders JPG or PNG</span>
          </FilePicker>
        )}
        <p className="cms-help">
          Shown as a small circle beside the attribution, the same as the
          testimonials further down the homepage. Optional — without one the
          attribution sits on its own.
        </p>
      </div>

      <div className="cms-card">
        <span className="cms-label">Chapters</span>

        <div className="cms-segments" role="tablist">
          {CHAPTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              className="cms-segment"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
              {chapterLength(draft.chapters[key]) > LIMITS.chapter && (
                <span className="cms-segment-dot" aria-label="over the limit" />
              )}
            </button>
          ))}
        </div>

        <div className="cms-field-head" style={{ marginTop: 8 }}>
          <span className="cms-help">
            {tab === "summary"
              ? "Summary is paragraphs only in the design — write it as plain lines."
              : "One line each. Start a line with a dash to make it a bullet; the site splits the bullets into two columns on desktop and tablet, and one on phones. Anything written after the bullets closes the chapter."}
          </span>
          <CharCount value={chapterCount} limit={LIMITS.chapter} />
        </div>

        <textarea
          className={`cms-textarea${chapterCount > LIMITS.chapter ? " cms-textarea--over" : ""}`}
          rows={14}
          value={chapterText[tab]}
          onChange={(event) => onChapterText(event.target.value)}
          aria-label={`${CHAPTERS.find(({ key }) => key === tab)?.label} chapter`}
          placeholder={
            tab === "summary"
              ? "One paragraph per line."
              : "An opening paragraph.\n\n- a bullet\n- another bullet\n\nAnything after the bullets closes the chapter."
          }
        />
      </div>

      {caseStudy && (
        <DeleteFooter
          help="Deleting removes this case study from the homepage."
          label="Delete case study"
          confirming={confirmDelete}
          disabled={pending}
          onDelete={() => remove(() => deleteCaseStudy(caseStudy.id))}
        />
      )}
    </div>
  );
}
