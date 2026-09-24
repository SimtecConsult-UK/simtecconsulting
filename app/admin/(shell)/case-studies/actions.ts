"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { validateCaseStudy } from "./limits";
import type { Chapters } from "../../../lib/caseStudies";
import type { SaveState } from "../../validation";

/**
 * Writes for the case studies section.
 *
 * As with the newsletter, every action re-checks that the caller is signed in:
 * a Server Action is a public endpoint, not a private function.
 */

export type CaseStudyInput = {
  id: string | null;
  position: number;
  tabLabel: string;
  headline: string;
  clientName: string;
  systemName: string;
  projectType: string;
  logoPath: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  videoPath: string | null;
  posterPath: string | null;
  quote: string;
  quoteAttribution: string;
  chapters: Chapters;
};

/** Case studies live on the homepage, so that is what needs refreshing. */
function refreshHomepage() {
  revalidatePath("/");
  revalidatePath("/admin/case-studies");
}

export async function saveCaseStudy(
  input: CaseStudyInput
): Promise<SaveState> {
  await requireEditor();

  const problem = validateCaseStudy(input);
  if (problem) return { error: problem };

  const supabase = await createClient();

  const row = {
    position: input.position,
    tab_label: input.tabLabel.trim(),
    headline: input.headline.trim(),
    client_name: input.clientName.trim(),
    system_name: input.systemName.trim(),
    project_type: input.projectType.trim(),
    logo_path: input.logoPath,
    logo_width: input.logoWidth,
    logo_height: input.logoHeight,
    video_path: input.videoPath,
    video_poster_path: input.posterPath,
    quote: input.quote.trim(),
    quote_attribution: input.quoteAttribution.trim(),
    chapters: input.chapters,
  };

  const query = input.id
    ? supabase.from("case_studies").update(row).eq("id", input.id).select("id").maybeSingle()
    : supabase.from("case_studies").insert(row).select("id").maybeSingle();

  const { data, error } = await query;

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Another case study already holds that position on the homepage. Reorder them from the list instead.",
      };
    }
    return { error: `Could not save: ${error.message}` };
  }

  refreshHomepage();

  if (!input.id && data?.id) redirect(`/admin/case-studies/${data.id}`);
  return { error: null };
}

export async function deleteCaseStudy(id: string) {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);

  if (error) return { error: `Could not delete: ${error.message}` };

  refreshHomepage();
  redirect("/admin/case-studies");
}

/**
 * Moves a case study up or down the homepage.
 *
 * The swap itself happens inside `move_case_study` in the database, in one
 * transaction: reordering either happens completely or not at all. Doing it as
 * separate writes from here meant a failure between them left the homepage in
 * an order nobody chose, with no way back except the SQL editor.
 */
export async function moveCaseStudy(id: string, direction: "up" | "down") {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.rpc("move_case_study", {
    target: id,
    direction,
  });

  if (error) {
    console.error(`[cms] reorder case study ${id}: ${error.message}`);
    return;
  }

  refreshHomepage();
}
