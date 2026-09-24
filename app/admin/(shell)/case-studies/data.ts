import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { EMPTY_CHAPTER, type Chapters } from "./limits";
import type { CaseStudyChapter } from "../../../lib/caseStudies";

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
  updatedAt: string;
};

type Row = {
  id: string;
  position: number;
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
  chapters: Partial<Chapters> | null;
  updated_at: string;
};

function chapter(stored: Partial<Chapters> | null, key: keyof Chapters): CaseStudyChapter {
  const value = stored?.[key];
  if (!value) return EMPTY_CHAPTER;
  return {
    paragraphs: value.paragraphs ?? [],
    bullets: value.bullets ?? [],
    closing: value.closing ?? [],
  };
}

export async function listCaseStudies(): Promise<CaseStudyListItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("id,position,tab_label,headline,logo_path,video_path,updated_at")
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
    updatedAt: row.updated_at,
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
    chapters: {
      summary: chapter(row.chapters, "summary"),
      problem: chapter(row.chapters, "problem"),
      solution: chapter(row.chapters, "solution"),
      value: chapter(row.chapters, "value"),
    },
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
