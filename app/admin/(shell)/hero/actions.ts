"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { ROUTES } from "../../../lib/sections";
import type { SaveState } from "../../validation";
import { validateHero } from "./limits";

/**
 * Writes for the homepage hero.
 *
 * Like every other action in the CMS these start with `requireEditor()`,
 * because a Server Action is a real endpoint anyone can call; row-level
 * security refuses the write behind it regardless.
 */

export type HeroInput = {
  headlineLead: string;
  headlineAccent: string;
  subhead: string;
  ctaLabel: string;
  videoPath: string | null;
};

export async function saveHero(input: HeroInput): Promise<SaveState> {
  await requireEditor();

  const problem = validateHero(input);
  if (problem) return { error: problem };

  const supabase = await createClient();
  // Upserted rather than updated, for the reason site_settings is: the
  // migration inserts the single row, but an update against a row that is not
  // there reports success having changed nothing, and the editor would say
  // "Saved" over wording that was not.
  const { error } = await supabase.from("homepage_hero").upsert(
    {
      id: true,
      // Stored as typed, never turned into null by being blank. Null means "no
      // one has touched this" and is what brings the original wording back, so
      // an editor who clears the blue ending gets a headline without one rather
      // than the old ending reappearing.
      headline_lead: input.headlineLead.trim(),
      headline_accent: input.headlineAccent.trim(),
      subhead: input.subhead.trim(),
      cta_label: input.ctaLabel.trim(),
      video_path: input.videoPath,
    },
    // The table holds exactly one row, pinned by its primary key.
    { onConflict: "id" }
  );

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath(ROUTES.home);
  return { error: null };
}

/**
 * Puts the hero's wording back to the words the site was built with.
 *
 * The columns are nulled rather than written with those words, so "never
 * edited" and "edited back to the original" stay the same state — the same
 * choice `resetPageSeo` makes. The recording is left alone: it is not wording,
 * and losing an upload to a button labelled "reset the wording" would be a
 * nasty surprise.
 */
export async function resetHeroWording(): Promise<SaveState> {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.from("homepage_hero").upsert(
    {
      id: true,
      headline_lead: null,
      headline_accent: null,
      subhead: null,
      cta_label: null,
    },
    { onConflict: "id" }
  );

  if (error) return { error: `Could not reset: ${error.message}` };

  revalidatePath(ROUTES.home);
  return { error: null };
}
