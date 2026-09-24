import { cache } from "react";
import { supabasePublic } from "./supabase/public";
import { isSupabaseConfigured } from "./supabase/config";
import { BUCKETS, publicUrl } from "./supabase/storage";
import {
  MAX_HOMEPAGE_CASE_STUDIES,
  caseStudies as committedCaseStudies,
  type CaseStudy,
  type CaseStudyChapter,
} from "./caseStudies";

/**
 * Where the homepage's case studies come from.
 *
 * Kept apart from `caseStudies.ts` because that file is imported by
 * `CaseStudies.tsx`, which is a Client Component — pulling the Supabase server
 * client in there would break the build. The component takes its studies as a
 * prop and `app/page.tsx` calls this.
 */

type CaseStudyRow = {
  id: string;
  tab_label: string;
  headline: string;
  client_name: string;
  system_name: string;
  project_type: string;
  logo_path: string | null;
  logo_width: number | null;
  logo_height: number | null;
  video_path: string | null;
  video_poster_path: string | null;
  quote: string;
  quote_attribution: string;
  chapters: Partial<Record<keyof CaseStudy["chapters"], CaseStudyChapter>> | null;
};

const EMPTY_CHAPTER: CaseStudyChapter = {
  paragraphs: [],
  bullets: [],
  closing: [],
};

function chapter(
  chapters: CaseStudyRow["chapters"],
  key: keyof CaseStudy["chapters"]
): CaseStudyChapter {
  const value = chapters?.[key];
  if (!value) return EMPTY_CHAPTER;
  return {
    paragraphs: value.paragraphs ?? [],
    bullets: value.bullets ?? [],
    closing: value.closing ?? [],
  };
}

function toCaseStudy(row: CaseStudyRow): CaseStudy {
  return {
    id: row.id,
    tabLabel: row.tab_label,
    headline: row.headline,
    clientName: row.client_name,
    systemName: row.system_name,
    projectType: row.project_type,
    logo: {
      src: publicUrl(BUCKETS.caseStudyMedia, row.logo_path) ?? "",
      width: row.logo_width ?? 0,
      height: row.logo_height ?? 0,
    },
    video: publicUrl(BUCKETS.caseStudyMedia, row.video_path) ?? "",
    videoPoster:
      publicUrl(BUCKETS.caseStudyMedia, row.video_poster_path) ?? undefined,
    quote: row.quote,
    quoteAttribution: row.quote_attribution,
    chapters: {
      summary: chapter(row.chapters, "summary"),
      problem: chapter(row.chapters, "problem"),
      solution: chapter(row.chapters, "solution"),
      value: chapter(row.chapters, "value"),
    },
  };
}

/**
 * The case studies the homepage section renders, in their published order.
 *
 * Unlike the blog, a failed read falls back to the copy committed in
 * `caseStudies.ts`. That content is the real thing rather than placeholder
 * text, and the section is a permanent part of the homepage — showing the last
 * known-good version beats leaving a hole in the page.
 */
export const getCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  const committed = committedCaseStudies.slice(0, MAX_HOMEPAGE_CASE_STUDIES);
  if (!isSupabaseConfigured) return committed;

  const { data, error } = await supabasePublic()
    .from("case_studies")
    .select(
      "id,tab_label,headline,client_name,system_name,project_type,logo_path,logo_width,logo_height,video_path,video_poster_path,quote,quote_attribution,chapters"
    )
    .order("position", { ascending: true })
    .limit(MAX_HOMEPAGE_CASE_STUDIES);

  if (error) {
    console.error(`[case studies] read: ${error.message}`);
    return committed;
  }
  if (data.length === 0) return committed;

  return (data as CaseStudyRow[]).map(toCaseStudy);
});
