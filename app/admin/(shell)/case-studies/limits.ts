import type { CaseStudyChapter } from "../../../lib/caseStudies";

/**
 * The handover's character limits, kept out of `actions.ts` because a
 * `"use server"` file may only export async functions — and the editor needs
 * these on the client to draw its counters.
 *
 * Why they matter: the section holds the height of its tallest chapter across
 * every client, so one runaway field leaves empty space under all the others.
 */
export const LIMITS = {
  tabLabel: 22,
  headline: 70,
  clientName: 40,
  systemName: 40,
  projectType: 120,
  quote: 260,
  quoteAttribution: 40,
  chapter: 1200,
} as const;

export const CHAPTER_LABELS = {
  summary: "Summary",
  problem: "Problem",
  solution: "Solution",
  value: "Intended Value",
} as const;

export type ChapterKey = keyof typeof CHAPTER_LABELS;

/** The four chapters, as stored on the row. */
export type Chapters = Record<ChapterKey, CaseStudyChapter>;

export const EMPTY_CHAPTER: CaseStudyChapter = {
  paragraphs: [],
  bullets: [],
  closing: [],
};

export const EMPTY_CHAPTERS: Chapters = {
  summary: EMPTY_CHAPTER,
  problem: EMPTY_CHAPTER,
  solution: EMPTY_CHAPTER,
  value: EMPTY_CHAPTER,
};

/** Paragraphs plus bullets — what the 1,200 limit counts. */
export function chapterLength(chapter: CaseStudyChapter): number {
  return [...chapter.paragraphs, ...chapter.bullets, ...chapter.closing].reduce(
    (total, line) => total + line.length,
    0
  );
}
