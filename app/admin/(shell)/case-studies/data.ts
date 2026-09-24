import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { toChapters } from "../../../lib/caseStudies";
import type { CaseStudyRow, Chapters } from "../../../lib/caseStudies";

export type EditableCaseStudy = {
  id: string;
  position: number;
  tabLabel: string;
  headline: string;
  clientName: string;
  systemName: string;
  projectType: string;
  logo: { path: string | null; url: string | null; width: number | null; height: number | null };
  video: { path: string | null; url: string | null };
  poster: { path: string | null; url: string | null };
  quote: string;
  quoteAttribution: string;
  chapters: Chapters;
};

export type CaseStudyListItem = Pick<
  EditableCaseStudy,
  "id" | "position" | "tabLabel" | "headline"
> & {
  logoUrl: string | null;
  hasVideo: boolean;
};

/** The shared row plus the two columns only the editor reads. */
type Row = CaseStudyRow & {
  position: number;
  updated_at: string;
};

export async function listCaseStudies(): Promise<CaseStudyListItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("id,position,tab_label,headline,logo_path,video_path")
    .order("position", { ascending: true });

  if (error) {
    console.error(`[cms] list case studies: ${error.message}`);
    return [];
  }

  return (data as Row[]).map((row) => ({
    id: row.id,
    position: row.position,
    tabLabel: row.tab_label,
    headline: row.headline,
    logoUrl: publicUrl(BUCKETS.caseStudyMedia, row.logo_path),
    hasVideo: Boolean(row.video_path),
  }));
}

export async function getCaseStudyForEdit(
  id: string
): Promise<EditableCaseStudy | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`[cms] load case study ${id}: ${error.message}`);
    return null;
  }
  if (!data) return null;

  const row = data as Row;
  return {
    id: row.id,
    position: row.position,
    tabLabel: row.tab_label,
    headline: row.headline,
    clientName: row.client_name,
    systemName: row.system_name,
    projectType: row.project_type,
    logo: {
      path: row.logo_path,
      url: publicUrl(BUCKETS.caseStudyMedia, row.logo_path),
      width: row.logo_width,
      height: row.logo_height,
    },
    video: {
      path: row.video_path,
      url: publicUrl(BUCKETS.caseStudyMedia, row.video_path),
    },
    poster: {
      path: row.video_poster_path,
      url: publicUrl(BUCKETS.caseStudyMedia, row.video_poster_path),
    },
    quote: row.quote,
    quoteAttribution: row.quote_attribution,
    chapters: toChapters(row.chapters),
  };
}

/** The next free slot, so a new case study lands at the end of the homepage. */
export async function nextPosition(): Promise<number> {
  if (!isSupabaseConfigured) return 1;

  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ((data as { position: number } | null)?.position ?? 0) + 1;
}
