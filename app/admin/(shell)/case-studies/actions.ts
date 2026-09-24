"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { CHAPTER_LABELS, LIMITS, chapterLength, type Chapters } from "./limits";

/**
 * Writes for the case studies section.
 *
 * As with the newsletter, every action re-checks that the caller is signed in:
 * a Server Action is a public endpoint, not a private function.
 */

export type SaveState = { error: string | null; savedAt: number | null };

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

function validate(input: CaseStudyInput): string | null {
  const fields: [string, string, number][] = [
    ["client name in the switcher", input.tabLabel, LIMITS.tabLabel],
    ["headline", input.headline, LIMITS.headline],
    ["client", input.clientName, LIMITS.clientName],
    ["system", input.systemName, LIMITS.systemName],
    ["project type", input.projectType, LIMITS.projectType],
    ["quote", input.quote, LIMITS.quote],
    ["attribution", input.quoteAttribution, LIMITS.quoteAttribution],
  ];

  for (const [name, value, limit] of fields) {
    if (!value.trim()) return `Fill in the ${name} before saving.`;
    if (value.length > limit)
      return `The ${name} is ${value.length} characters; the limit is ${limit}.`;
  }

  for (const key of Object.keys(CHAPTER_LABELS) as (keyof Chapters)[]) {
    const length = chapterLength(input.chapters[key]);
    if (length > LIMITS.chapter) {
      return `The ${CHAPTER_LABELS[key]} chapter is ${length} characters; the limit is ${LIMITS.chapter}.`;
    }
  }

  if (!input.logoPath) return "Upload the client's logo — the details bar and the phone tiles both show it.";
  if (!input.videoPath) return "Upload the screen recording; the section is built around it.";

  return null;
}

/** Case studies live on the homepage, so that is what needs refreshing. */
function refreshHomepage() {
  revalidatePath("/");
  revalidatePath("/admin/case-studies");
}

export async function saveCaseStudy(
  input: CaseStudyInput
): Promise<SaveState> {
  await requireEditor();

  const problem = validate(input);
  if (problem) return { error: problem, savedAt: null };

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
        savedAt: null,
      };
    }
    return { error: `Could not save: ${error.message}`, savedAt: null };
  }

  refreshHomepage();

  if (!input.id && data?.id) redirect(`/admin/case-studies/${data.id}`);
  return { error: null, savedAt: Date.now() };
}

export async function deleteCaseStudy(id: string) {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);

  if (error) return { error: `Could not delete: ${error.message}`, savedAt: null };

  refreshHomepage();
  redirect("/admin/case-studies");
}

/**
 * Swaps a case study with its neighbour.
 *
 * `position` is unique, so the two rows cannot simply be written to each
 * other's slot — the first update would collide. The moving row is parked on a
 * free negative slot first, which no real row ever uses.
 */
export async function moveCaseStudy(id: string, direction: "up" | "down") {
  await requireEditor();

  const supabase = await createClient();

  const { data: rows, error: readError } = await supabase
    .from("case_studies")
    .select("id,position")
    .order("position", { ascending: true });

  if (readError || !rows) return;

  const ordered = rows as { id: string; position: number }[];
  const index = ordered.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ordered.length) return;

  const moving = ordered[index];
  const other = ordered[target];

  await supabase.from("case_studies").update({ position: -1 }).eq("id", moving.id);
  await supabase.from("case_studies").update({ position: moving.position }).eq("id", other.id);
  await supabase.from("case_studies").update({ position: other.position }).eq("id", moving.id);

  refreshHomepage();
}
