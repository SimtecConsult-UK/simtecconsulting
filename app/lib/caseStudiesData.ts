import { cache } from "react";
import { supabasePublic } from "./supabase/public";
import { isSupabaseConfigured } from "./supabase/config";
import { BUCKETS, publicUrl } from "./supabase/storage";
import {
  MAX_HOMEPAGE_CASE_STUDIES,
  toChapters,
  type CaseStudy,
  type CaseStudyRow,
} from "./caseStudies";

/**
 * Where the homepage's case studies come from.
 *
 * Kept apart from `caseStudies.ts` because that file is imported by
 * `CaseStudies.tsx`, which is a Client Component — pulling the Supabase server
 * client in there would break the build. The component takes its studies as a
 * prop and `app/page.tsx` calls this.
 */

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
    chapters: toChapters(row.chapters),
  };
}

/**
 * The case studies the homepage section renders, in their published order.
 *
 * The database is the only source, so the homepage and the CMS always agree.
 * No rows means no section: `CaseStudies.tsx` renders nothing for an empty
 * list rather than leaving an empty frame.
 */
export const getCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabasePublic()
    .from("case_studies")
    .select(
      "id,tab_label,headline,client_name,system_name,project_type,logo_path,logo_width,logo_height,video_path,video_poster_path,quote,quote_attribution,chapters"
    )
    .order("position", { ascending: true })
    .limit(MAX_HOMEPAGE_CASE_STUDIES);

  if (error) {
    console.error(`[case studies] read: ${error.message}`);
    return [];
  }

  return (data as CaseStudyRow[]).map(toCaseStudy);
});
