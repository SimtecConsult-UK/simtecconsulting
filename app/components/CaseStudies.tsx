"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ibmPlexSans } from "../lib/fonts";
import { SECTION_IDS } from "../lib/sections";
import {
  CHAPTERS,
  DEFAULT_CHAPTER,
  MAX_HOMEPAGE_CASE_STUDIES,
  caseStudies,
  quoteParagraphs,
  type CaseStudyChapter,
  type ChapterKey,
} from "../lib/caseStudies";
import "./case-studies.css";

// Scoped to this section, following app/discovery: next/font exposes each family
// as a CSS variable, the section carries the variables, and case-studies.css
// reads them. IBM Plex Sans is shared via ../lib/fonts so it isn't loaded twice.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

/** Fixed chrome, not CMS content — the details bar reads these off each study. */
const DETAILS = [
  ["Client", "clientName"],
  ["System", "systemName"],
  ["Project type", "projectType"],
] as const;

/**
 * Marks one of several stacked versions of a block. Only the active one is
 * visible, but all of them occupy the same cell, so the block keeps the height
 * of its tallest version and switching client never moves the page.
 */
function stacked(on: boolean) {
  return { "data-on": on, "aria-hidden": !on };
}

/**
 * The paragraphs, bullets and closing paragraphs of one chapter, for one client.
 * Memoised because every chapter of every client stays mounted: without it, one
 * tab click re-renders all of them to change nothing.
 */
const ChapterPane = memo(function ChapterPane({
  chapter,
  chapterKey,
  active,
}: {
  chapter: CaseStudyChapter;
  chapterKey: ChapterKey;
  active: boolean;
}) {
  return (
    <div {...stacked(active)}>
      {chapter.paragraphs.length > 0 && (
        <div className="cs-pane-paras">
          {chapter.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {chapter.bullets.length > 0 && (
        // Authored as one flat list; the stylesheet splits it into two columns
        // from tablet up, and turns Solution into chips on the phone.
        <ul className="cs-bullets" data-chips={chapterKey === "solution"}>
          {chapter.bullets.map((b, i) => (
            <li className="cs-bullet" key={i}>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {chapter.closing.length > 0 && (
        <div className="cs-pane-paras cs-pane-closing">
          {chapter.closing.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
});

export function CaseStudies() {
  const studies = caseStudies.slice(0, MAX_HOMEPAGE_CASE_STUDIES);

  const [activeClient, setActiveClient] = useState(0);
  const [activeChapter, setActiveChapter] = useState<ChapterKey>(DEFAULT_CHAPTER);
  /** Phone only: the open chapter was tapped again to close it. */
  const [collapsed, setCollapsed] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const onScreenRef = useRef(false);
  const activeClientRef = useRef(activeClient);

  /** Play the visible client's recording, but only while the section is in view. */
  const syncVideos = useCallback(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (onScreenRef.current && i === activeClientRef.current) video.play().catch(() => {});
      else video.pause();
    });
  }, []);

  useEffect(() => {
    activeClientRef.current = activeClient;
    syncVideos();
  }, [activeClient, syncVideos]);

  // The observer only answers "is the section on screen", so it outlives client
  // switches — rebuilding it per switch would stall the newly selected video
  // until the fresh observer's first callback landed.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreenRef.current = entry.isIntersecting;
        syncVideos();
      },
      { rootMargin: "200px" },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, [syncVideos]);

  if (studies.length === 0) return null;

  const selectChapter = (key: ChapterKey) => {
    // On the phone, tapping the open chapter closes it; everywhere else the
    // chapters are tabs, and re-picking the current one is a no-op.
    setCollapsed((wasCollapsed) => key === activeChapter && !wasCollapsed);
    setActiveChapter(key);
  };

  const isOpen = (key: ChapterKey) => key === activeChapter && !collapsed;

  return (
    <section
      id={SECTION_IDS.caseStudies}
      ref={sectionRef}
      className={`cs ${grotesk.variable} ${plexMono.variable} ${ibmPlexSans.variable}`}
      aria-labelledby="cs-heading"
    >
      <div className="cs-panel">
        {/* ── Header: eyebrow, headline, client switcher ── */}
        <div className="cs-head">
          <div>
            <div className="cs-eyebrow">Case Studies</div>
            <h2 className="cs-h2" id="cs-heading">
              {studies.map((study, i) => (
                <span key={study.id} {...stacked(i === activeClient)}>
                  {study.headline}
                </span>
              ))}
            </h2>
          </div>

          <div className="cs-switch" role="tablist" aria-label="Choose a client">
            {studies.map((study, i) => (
              <button
                key={study.id}
                type="button"
                role="tab"
                aria-selected={i === activeClient}
                aria-label={study.tabLabel}
                className="cs-switch-btn"
                onClick={() => setActiveClient(i)}
              >
                {/* The phone picker shows the logo, every wider breakpoint the
                    label; the stylesheet decides which. */}
                {/* eslint-disable-next-line @next/next/no-img-element --
                    laid out by CSS `contain` in a fixed box, not by intrinsic
                    size, and below the fold so it lazy-loads. */}
                <img
                  className="cs-switch-logo"
                  src={study.logo.src}
                  width={study.logo.width}
                  height={study.logo.height}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                />
                <span className="cs-switch-label">{study.tabLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Screen recording, in a MacBook mockup from tablet up ── */}
        <div className="cs-video">
          <div className="cs-screen">
            <span className="cs-camera" aria-hidden="true" />
            <div className="cs-screen-inner">
              {studies.map((study, i) => (
                <video
                  key={study.id}
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={study.video}
                  poster={study.videoPoster}
                  muted
                  loop
                  playsInline
                  // Hidden videos are still fetched, so only the one on show
                  // reaches for its file. Matters once each client has its own.
                  preload={i === activeClient ? "metadata" : "none"}
                  aria-label={`${study.tabLabel} system walkthrough`}
                  style={{ display: i === activeClient ? "block" : "none" }}
                />
              ))}
            </div>
          </div>
          <div className="cs-base" aria-hidden="true">
            <div className="cs-notch" />
          </div>
        </div>

        <div className="cs-body">
          {/* ── Client quote ── */}
          <div className="cs-quote-cell">
            {studies.map((study, i) => (
              <figure key={study.id} className="cs-quote" {...stacked(i === activeClient)}>
                <div className="cs-quote-mark" aria-hidden="true">
                  &ldquo;
                </div>
                <blockquote className="cs-quote-text">
                  {quoteParagraphs(study.quote).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </blockquote>
                <figcaption>{study.quoteAttribution}</figcaption>
              </figure>
            ))}
          </div>

          {/* ── Chapters ──
              One set of buttons and one copy of the text serve all three
              arrangements: an accordion on the phone, a sticky rail on
              tablet, and a tab row on laptop and desktop. The stylesheet
              places them; `.cs-rail` is `display:contents` on the phone so
              each button sits directly above its own body. */}
          <div className="cs-chapters">
            <div className="cs-rail" role="tablist" aria-label="Case study chapters">
              {CHAPTERS.map((chapter, i) => (
                <button
                  key={chapter.key}
                  type="button"
                  role="tab"
                  data-i={i}
                  className="cs-chap-btn"
                  aria-selected={chapter.key === activeChapter}
                  aria-expanded={isOpen(chapter.key)}
                  aria-controls={`cs-chapter-${chapter.key}`}
                  onClick={() => selectChapter(chapter.key)}
                >
                  <span className="cs-chap-num">{`0${i + 1}`}</span>
                  <span className="cs-chap-label">{chapter.label}</span>
                  <span className="cs-chap-toggle" aria-hidden="true">
                    {isOpen(chapter.key) ? "−" : "+"}
                  </span>
                </button>
              ))}
            </div>

            {CHAPTERS.map((chapter, i) => (
              <div
                key={chapter.key}
                id={`cs-chapter-${chapter.key}`}
                className="cs-chap-body"
                data-i={i}
                data-active={chapter.key === activeChapter}
                data-open={isOpen(chapter.key)}
              >
                {studies.map((study, j) => (
                  <ChapterPane
                    key={study.id}
                    chapter={study.chapters[chapter.key]}
                    chapterKey={chapter.key}
                    active={j === activeClient}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* ── Details bar: logo, client, system, project type ── */}
          <div className="cs-details">
            <div className="cs-logo-cell">
              {studies.map((study, i) => (
                /* eslint-disable-next-line @next/next/no-img-element -- as above. */
                <img
                  key={study.id}
                  src={study.logo.src}
                  width={study.logo.width}
                  height={study.logo.height}
                  alt={`${study.tabLabel} logo`}
                  loading="lazy"
                  decoding="async"
                  {...stacked(i === activeClient)}
                />
              ))}
            </div>

            {DETAILS.map(([label, field]) => (
              <div className="cs-detail" key={label}>
                <div className="cs-detail-label">{label}</div>
                <div className="cs-detail-vals">
                  {studies.map((study, i) => (
                    <div key={study.id} {...stacked(i === activeClient)}>
                      {study[field]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
