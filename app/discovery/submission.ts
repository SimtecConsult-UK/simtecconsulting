import type { Answers, RepRow } from "./data";

/**
 * What the wizard sends, and the caps the action applies to it.
 *
 * A plain module rather than part of `actions.ts`, because a `"use server"`
 * file may only export async functions — every other export becomes a call
 * handle instead of the value.
 */
export type SubmissionInput = {
  answers: Answers;
  repRows: Record<string, RepRow[]>;
  consent: boolean;
};

/** Matched by the column constraints in supabase/migrations/0005. */
export const SUBMISSION_LIMITS = {
  company: 200,
  contactName: 200,
  contactRole: 200,
  email: 320,
  phone: 60,
  projectName: 200,
  /** The whole answers payload, well above a full wizard and well under the column cap. */
  payloadBytes: 200_000,
} as const;
