import { CHAPTERS, type CaseStudyChapter } from "../../../lib/caseStudies";
import { checkLimits, type FieldCheck } from "../../validation";
import type { CaseStudyInput } from "./actions";

/**
 * The handover's character limits, kept out of `actions.ts` because a
 * `"use server"` file may only export async functions — and the editor needs
 * these on the client to draw its counters.
 *
 * Why they matter: the section holds the height of its tallest chapter across
 * every client, so one runaway field leaves empty space under all the others.
 *
 * The chapter keys, labels and normaliser live in `app/lib/caseStudies.ts`,
 * which the homepage reads too.
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

/** Paragraphs plus bullets — what the 1,200 limit counts. */
export function chapterLength(chapter: CaseStudyChapter): number {
  return [...chapter.paragraphs, ...chapter.bullets, ...chapter.closing].reduce(
    (total, line) => total + line.length,
    0
  );
}

/** Every capped field, in the order an editor should fix them. */
function fields(input: CaseStudyInput): FieldCheck[] {
  return [
    { name: "client name in the switcher", value: input.tabLabel, limit: LIMITS.tabLabel, required: "Fill in the client name in the switcher before saving." },
    { name: "headline", value: input.headline, limit: LIMITS.headline, required: "Fill in the headline before saving." },
    { name: "client", value: input.clientName, limit: LIMITS.clientName, required: "Fill in the client before saving." },
    { name: "system", value: input.systemName, limit: LIMITS.systemName, required: "Fill in the system before saving." },
    { name: "project type", value: input.projectType, limit: LIMITS.projectType, required: "Fill in the project type before saving." },
    { name: "quote", value: input.quote, limit: LIMITS.quote, required: "Fill in the quote before saving." },
    { name: "attribution", value: input.quoteAttribution, limit: LIMITS.quoteAttribution, required: "Fill in the attribution before saving." },
  ];
}

function chapterTooLong(input: CaseStudyInput): string | null {
  for (const { key, label } of CHAPTERS) {
    const length = chapterLength(input.chapters[key]);
    if (length > LIMITS.chapter) {
      return `The ${label} chapter is ${length} characters; the limit is ${LIMITS.chapter}.`;
    }
  }
  return null;
}

/**
 * Only the too-long problems. The editor greys Save out on this and shows the
 * sentence, so it says the same thing the server would have said.
 */
export function caseStudyTooLong(input: CaseStudyInput): string | null {
  return checkLimits(fields(input)) ?? chapterTooLong(input);
}

/**
 * Everything that must be true before a case study can be written. Lives here
 * rather than in `actions.ts` so the editor shares the list above.
 */
export function validateCaseStudy(input: CaseStudyInput): string | null {
  const problem =
    checkLimits(fields(input), { includeRequired: true }) ?? chapterTooLong(input);
  if (problem) return problem;

  if (!input.logoPath) return "Upload the client's logo — the details bar and the phone tiles both show it.";
  if (!input.videoPath) return "Upload the screen recording; the section is built around it.";

  return null;
}
