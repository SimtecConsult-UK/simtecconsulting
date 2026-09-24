"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CharCount } from "../../CharCount";
import { deleteCaseStudy, saveCaseStudy, type CaseStudyInput } from "./actions";
import {
  CHAPTER_LABELS,
  EMPTY_CHAPTERS,
  LIMITS,
  chapterLength,
  type ChapterKey,
} from "./limits";
import type { EditableCaseStudy } from "./data";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { imageSize, uploadFile, videoInfo } from "../../upload";
import { checkVideo, describeFailures, type Check } from "./video-checks";
import type { CaseStudyChapter } from "../../../lib/caseStudies";

type Props = {
  caseStudy: EditableCaseStudy | null;
  /** Slot a new case study takes on the homepage. */
  nextPosition: number;
};

/** Paragraphs are written one per blank-separated block; bullets one per line. */
const linesToList = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const listToLines = (list: string[]) => list.join("\n");

export function CaseStudyEditor({ caseStudy, nextPosition }: Props) {
  const [draft, setDraft] = useState<CaseStudyInput>(() =>
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
          chapters: caseStudy.chapters,
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
          chapters: EMPTY_CHAPTERS,
        }
  );

  const [logoUrl, setLogoUrl] = useState(caseStudy?.logo.url ?? null);
  const [videoUrl, setVideoUrl] = useState(caseStudy?.video.url ?? null);
  const [posterUrl, setPosterUrl] = useState(caseStudy?.poster.url ?? null);
  const [videoChecks, setVideoChecks] = useState<Check[]>([]);
  const [tab, setTab] = useState<ChapterKey>("solution");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof CaseStudyInput>(key: K, value: CaseStudyInput[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setSaved(false);
  };

  const setChapter = (key: ChapterKey, patch: Partial<CaseStudyChapter>) => {
    set("chapters", {
      ...draft.chapters,
      [key]: { ...draft.chapters[key], ...patch },
    });
  };

  const overLimit =
    draft.tabLabel.length > LIMITS.tabLabel ||
    draft.headline.length > LIMITS.headline ||
    draft.clientName.length > LIMITS.clientName ||
    draft.systemName.length > LIMITS.systemName ||
    draft.projectType.length > LIMITS.projectType ||
    draft.quote.length > LIMITS.quote ||
    draft.quoteAttribution.length > LIMITS.quoteAttribution ||
    (Object.keys(CHAPTER_LABELS) as ChapterKey[]).some(
      (key) => chapterLength(draft.chapters[key]) > LIMITS.chapter
    );

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveCaseStudy(draft);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDirty(false);
      setSaved(true);
    });
  };

  const onLogo = async (file: File) => {
    setBusy("logo");
    setError(null);
    try {
      const { width, height } = await imageSize(file);
      const result = await uploadFile(BUCKETS.caseStudyMedia, "logos", file);
      if (!result.ok) {
        setError(`That logo did not upload: ${result.error}`);
        return;
      }
      setDraft((current) => ({
        ...current,
        logoPath: result.path,
        logoWidth: width,
        logoHeight: height,
      }));
      setLogoUrl(publicUrl(BUCKETS.caseStudyMedia, result.path));
      setDirty(true);
      setSaved(false);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That logo could not be read.");
    } finally {
      setBusy(null);
    }
  };

  const onVideo = async (file: File) => {
    setBusy("video");
    setError(null);
    try {
      const info = await videoInfo(file);
      const checks = checkVideo(file, info);
      setVideoChecks(checks);

      const failure = describeFailures(checks);
      if (failure) {
        // Rejected before upload: nothing that would look wrong on the
        // homepage reaches storage in the first place.
        setError(failure);
        return;
      }

      const result = await uploadFile(BUCKETS.caseStudyMedia, "videos", file);
      if (!result.ok) {
        setError(`That recording did not upload: ${result.error}`);
        return;
      }
      set("videoPath", result.path);
      setVideoUrl(publicUrl(BUCKETS.caseStudyMedia, result.path));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That recording could not be read.");
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

  const field = (
    label: string,
    key: "tabLabel" | "headline" | "clientName" | "systemName" | "projectType" | "quoteAttribution",
    limit: number,
    help?: string
  ) => (
    <label className="cms-field">
      <span className="cms-field-head">
        <span className="cms-label">{label}</span>
        <CharCount value={draft[key].length} limit={limit} />
      </span>
      <input
        className={`cms-input${draft[key].length > limit ? " cms-input--over" : ""}`}
        value={draft[key]}
        onChange={(event) => set(key, event.target.value)}
      />
      {help && <span className="cms-help">{help}</span>}
    </label>
  );

  const chapter = draft.chapters[tab];
  const chapterCount = chapterLength(chapter);

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/case-studies" className="cms-link-btn">
        ← All case studies
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          className="cms-title-input"
          value={draft.tabLabel}
          onChange={(event) => set("tabLabel", event.target.value)}
          placeholder="Client name"
          aria-label="Client name"
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span className="cms-mono">
            {dirty ? "Unsaved changes" : saved ? "All changes saved" : `Position ${draft.position} on the homepage`}
          </span>
          <button type="button" className="cms-btn cms-btn--primary" onClick={submit} disabled={pending || overLimit}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {error && <div className="cms-banner cms-banner--error" role="alert">{error}</div>}
      {saved && !error && (
        <div className="cms-banner cms-banner--ok" role="status">
          Saved. The homepage shows this straight away.
        </div>
      )}

      <div className="cms-card">
        <span className="cms-label">Switcher and heading</span>
        {field("Client name in the switcher", "tabLabel", LIMITS.tabLabel, "Must fit one line on a tablet.")}
        {field("Headline", "headline", LIMITS.headline, "Wraps to at most two lines on a laptop.")}
      </div>

      <div className="cms-card">
        <span className="cms-label">Screen recording</span>
        {videoUrl ? (
          <>
            <div className="cms-preview">
              <video src={videoUrl} controls muted playsInline />
            </div>
            <div className="cms-file-row">
              <label className="cms-btn cms-btn--secondary" style={{ cursor: "pointer" }}>
                Replace video
                <input type="file" accept="video/mp4,video/webm" hidden disabled={busy !== null} onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void onVideo(file);
                }} />
              </label>
              <button type="button" className="cms-btn cms-btn--danger" onClick={() => { set("videoPath", null); setVideoUrl(null); setVideoChecks([]); }}>
                Remove
              </button>
            </div>
          </>
        ) : (
          <label className="cms-drop">
            <span>{busy === "video" ? "Checking…" : "Choose the screen recording"}</span>
            <span className="cms-mono">MP4 or WebM · 16:9 · 10–45s · under 15 MB</span>
            <input type="file" accept="video/mp4,video/webm" hidden disabled={busy !== null} onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onVideo(file);
            }} />
          </label>
        )}

        {videoChecks.length > 0 && (
          <div className="cms-specs">
            {videoChecks.map((check) => (
              <span key={check.label} className={`cms-spec cms-spec--${check.ok ? "ok" : "bad"}`}>
                {check.ok ? "✓" : "✕"} {check.label}
                {check.detail ? ` · ${check.detail}` : ""}
              </span>
            ))}
          </div>
        )}

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
              <label className="cms-btn cms-btn--secondary" style={{ cursor: "pointer" }}>
                Replace
                <input type="file" accept="image/*" hidden disabled={busy !== null} onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void onLogo(file);
                }} />
              </label>
            </>
          ) : (
            <label className="cms-drop">
              <span>{busy === "logo" ? "Uploading…" : "Choose the client's logo"}</span>
              <span className="cms-mono">SVG or transparent PNG</span>
              <input type="file" accept="image/*" hidden disabled={busy !== null} onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void onLogo(file);
              }} />
            </label>
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
            <label className="cms-drop">
              <span>{busy === "poster" ? "Uploading…" : "Choose a poster image"}</span>
              <span className="cms-mono">1920×1080 JPG or WebP</span>
              <input type="file" accept="image/*" hidden disabled={busy !== null} onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void onPoster(file);
              }} />
            </label>
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
          {field("Client", "clientName", LIMITS.clientName)}
          {field("System", "systemName", LIMITS.systemName)}
        </div>
        {field("Project type", "projectType", LIMITS.projectType, "Up to three lines on a laptop.")}
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
        {field("Attribution", "quoteAttribution", LIMITS.quoteAttribution, 'Shown in capitals, e.g. "Tina · Compli Digital".')}
      </div>

      <div className="cms-card">
        <span className="cms-label">Chapters</span>

        <div className="cms-segments" role="tablist">
          {(Object.keys(CHAPTER_LABELS) as ChapterKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              className="cms-segment"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              {CHAPTER_LABELS[key]}
              {chapterLength(draft.chapters[key]) > LIMITS.chapter && (
                <span className="cms-segment-dot" aria-label="over the limit" />
              )}
            </button>
          ))}
        </div>

        <div className="cms-field-head" style={{ marginTop: 8 }}>
          <span className="cms-help">
            {tab === "summary"
              ? "Summary is paragraphs only — it has no bullet list in the design."
              : "Enter bullets as one list, one per line. The site splits them into two columns on desktop and tablet, and one on phones."}
          </span>
          <CharCount value={chapterCount} limit={LIMITS.chapter} />
        </div>

        <label className="cms-field">
          <span className="cms-label">Opening paragraphs</span>
          <textarea
            className="cms-textarea"
            rows={4}
            value={listToLines(chapter.paragraphs)}
            onChange={(event) => setChapter(tab, { paragraphs: linesToList(event.target.value) })}
            placeholder="One paragraph per line."
          />
        </label>

        {tab !== "summary" && (
          <>
            <label className="cms-field">
              <span className="cms-label">Bullets</span>
              <textarea
                className="cms-textarea"
                rows={6}
                value={listToLines(chapter.bullets)}
                onChange={(event) => setChapter(tab, { bullets: linesToList(event.target.value) })}
                placeholder="One bullet per line."
              />
            </label>

            <label className="cms-field">
              <span className="cms-label">Closing paragraphs</span>
              <textarea
                className="cms-textarea"
                rows={3}
                value={listToLines(chapter.closing)}
                onChange={(event) => setChapter(tab, { closing: linesToList(event.target.value) })}
                placeholder="Optional. One paragraph per line."
              />
            </label>
          </>
        )}
      </div>

      {caseStudy && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid var(--cms-line)", paddingTop: 22 }}>
          <span className="cms-help">Deleting removes this case study from the homepage.</span>
          <button
            type="button"
            className="cms-btn cms-btn--danger"
            disabled={pending}
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }
              startTransition(async () => {
                const result = await deleteCaseStudy(caseStudy.id);
                if (result?.error) setError(result.error);
              });
            }}
          >
            {confirmDelete ? "Confirm delete" : "Delete case study"}
          </button>
        </div>
      )}
    </div>
  );
}
