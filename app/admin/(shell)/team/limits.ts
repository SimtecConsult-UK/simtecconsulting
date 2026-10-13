import { checkLimits, type FieldCheck } from "../../validation";
import { TEAM_SLOTS } from "../../../lib/homepage/types";
import type { TeamPhotoInput } from "./actions";

/**
 * How long a photo's description can be.
 *
 * Kept out of `actions.ts` for the reason every other section's limits are: a
 * `"use server"` file may only export async functions, so a client importing
 * `LIMITS` from there would get a call handle instead of the number and the
 * counter would read "24 / ".
 *
 * A description is read aloud by a screen reader in place of the photo. Past a
 * line or so it stops being a description and starts being a paragraph nobody
 * asked to hear.
 */
export const LIMITS = { alt: 120 } as const;

function fields(input: TeamPhotoInput[]): FieldCheck[] {
  return input.map((photo) => ({
    // Named by where it is, since five tiles would otherwise give five
    // identical sentences. Lower-cased because `checkLimits` reads it
    // mid-sentence: "The main photo description is 130 characters…".
    name: `${
      TEAM_SLOTS.find((slot) => slot.slot === photo.slot)?.name.toLowerCase() ?? "photo"
    } description`,
    value: photo.alt,
    limit: LIMITS.alt,
  }));
}

/**
 * Nothing is required — every tile falls back to the photo and the wording the
 * site was built with — so this is only the length check.
 */
export function validateTeamPhotos(input: TeamPhotoInput[]): string | null {
  return checkLimits(fields(input));
}
