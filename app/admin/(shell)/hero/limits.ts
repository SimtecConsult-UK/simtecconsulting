import { checkLimits, type FieldCheck } from "../../validation";
import type { HeroInput } from "./actions";

/**
 * How long the hero's wording can be before the design stops holding.
 *
 * Kept out of `actions.ts` for the reason the other sections' limits are: a
 * `"use server"` file may only export async functions, so a client importing
 * `LIMITS` from there would get a call handle instead of the numbers and every
 * counter would read "24 / ".
 *
 * The numbers come from the layout, not from taste. The headline is the
 * largest type on the site and is drawn over the cranes in the background
 * picture; past roughly a hundred characters across both halves it runs into a
 * fourth line and collides with the mock-up below it on a laptop. The
 * sub-heading sits in a fixed column and the button is a single pill.
 */
export const LIMITS = {
  headlineLead: 60,
  headlineAccent: 40,
  subhead: 260,
  ctaLabel: 24,
} as const;

function fields(input: HeroInput): FieldCheck[] {
  return [
    {
      name: "headline",
      value: input.headlineLead,
      limit: LIMITS.headlineLead,
      required: "The headline cannot be empty — it is the first thing on the page.",
    },
    // No `required`: a headline in one colour is a legitimate choice, and the
    // blue ending is the half that may be dropped.
    { name: "highlighted ending", value: input.headlineAccent, limit: LIMITS.headlineAccent },
    {
      name: "sub-heading",
      value: input.subhead,
      limit: LIMITS.subhead,
      required: "The sub-heading cannot be empty — the space under the headline would be blank.",
    },
    {
      name: "button wording",
      value: input.ctaLabel,
      limit: LIMITS.ctaLabel,
      required: "The button needs wording, or it appears as an empty pill.",
    },
  ];
}

/**
 * Only the too-long problems, so the editor can grey Save out and say why. An
 * empty required field is left to the server: a field you have not filled in
 * yet is not a mistake, it is somewhere you are in the middle of.
 */
export function heroTooLong(input: HeroInput): string | null {
  return checkLimits(fields(input));
}

export function validateHero(input: HeroInput): string | null {
  return checkLimits(fields(input), { includeRequired: true });
}
