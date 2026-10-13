"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { ROUTES } from "../../../lib/sections";
import { TEAM_SLOTS } from "../../../lib/homepage/types";
import type { SaveState } from "../../validation";
import { validateTeamPhotos } from "./limits";

/**
 * Writes for the team photos.
 *
 * Like every other action in the CMS this starts with `requireEditor()`,
 * because a Server Action is a real endpoint anyone can call; row-level
 * security refuses the write behind it regardless.
 */

export type TeamPhotoInput = {
  slot: number;
  /** Null means "use the photo the site was built with" — the row is deleted. */
  path: string | null;
  alt: string;
};

/**
 * All five tiles at once, because that is how they are edited: one Save over
 * the whole section rather than a save per photo.
 */
export async function saveTeamPhotos(input: TeamPhotoInput[]): Promise<SaveState> {
  await requireEditor();

  // The slots are never typed — they come from the fixed list in types.ts — so
  // anything else reaching here is a call that did not come from the editor.
  const known = new Set(TEAM_SLOTS.map((slot) => slot.slot));
  if (input.some((photo) => !known.has(photo.slot))) {
    return { error: "That is not a photo this section has." };
  }

  const problem = validateTeamPhotos(input);
  if (problem) return { error: problem };

  const supabase = await createClient();

  const uploaded = input.filter((photo) => photo.path);
  const cleared = input.filter((photo) => !photo.path).map((photo) => photo.slot);

  // Written before anything is removed, and the removal abandoned if the write
  // fails.
  //
  // The two touch different rows, so running them together would be quicker —
  // but Postgres gives us no way to undo the first if the second never happens,
  // and of the two half-done states this is the only safe one. A failed write
  // that still removed photos would report "could not save" over photos it had
  // already deleted; this way a failure leaves the section exactly as it was.
  if (uploaded.length > 0) {
    const { error } = await supabase.from("team_photos").upsert(
      uploaded.map((photo) => ({
        slot: photo.slot,
        path: photo.path,
        alt: photo.alt.trim() || null,
      })),
      // One row per tile: saving again replaces that tile's photo rather
      // than adding a second photo claiming the same position.
      { onConflict: "slot" }
    );
    if (error) return { error: `Could not save: ${error.message}` };
  }

  if (cleared.length > 0) {
    // Deleted rather than blanked, so "never changed" and "changed back to the
    // original" stay the same state — the same choice `resetPageSeo` makes.
    const { error } = await supabase.from("team_photos").delete().in("slot", cleared);
    if (error) return { error: `Could not save: ${error.message}` };
  }

  revalidatePath(ROUTES.home);
  return { error: null };
}
