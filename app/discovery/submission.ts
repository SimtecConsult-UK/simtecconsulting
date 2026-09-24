import { SECTIONS, hasText, type Answers, type RepRow } from "./data";
import { checkLimits, type FieldCheck } from "../admin/validation";

/**
 * What the wizard sends, and the rules the action applies to it.
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

/**
 * Where a submission has got to. One value rather than separate `submitted`
 * and `error` flags, which between them could describe states that cannot
 * happen.
 */
export type SubmitState =
  | { kind: "idle" }
  | { kind: "sent" }
  | { kind: "failed"; message: string };

/** What the overlays need to draw the submit button. */
export type SubmitStatus = { state: SubmitState; sending: boolean };

/** Shown for anything the visitor cannot act on, so a failure is never silent. */
export const SEND_FAILED =
  "We could not send your answers just now. Please try again.";

/**
 * The contact fields lifted into their own columns, and the caps that match
 * those columns in supabase/migrations/0005.
 *
 * Keyed by question id, so a question renamed in `SECTIONS` without renaming
 * it here becomes a type error rather than a wizard that silently stops
 * accepting anything.
 */
export const SUBMISSION_LIMITS = {
  company: 200,
  contactName: 200,
  contactRole: 200,
  email: 320,
  phone: 60,
  projectName: 200,
} as const;

export type ContactField = keyof typeof SUBMISSION_LIMITS;

export const CONTACT_FIELDS = Object.keys(SUBMISSION_LIMITS) as ContactField[];

/**
 * A whole wizard is a few kilobytes. The cap is a backstop against this public
 * endpoint being used to store something else; the byte-accurate one is the
 * `pg_column_size` check on the table.
 */
export const MAX_PAYLOAD_CHARS = 200_000;

/** The Project Basics questions, which is where every contact field lives. */
const BASICS = SECTIONS[0];

function question(id: ContactField) {
  return BASICS.questions.find((q) => q.id === id);
}

/**
 * Everything that must be true before a submission can be written.
 *
 * Length problems are reported rather than trimmed away: silently shortening
 * somebody's email to fit and then telling them it sent is how you end up with
 * an enquiry nobody can reply to. Field names and required-ness both come from
 * the question definitions, so the wizard and this check cannot disagree about
 * what is mandatory.
 */
export function validateSubmission(input: SubmissionInput): string | null {
  if (!input.consent) {
    return "Tick the consent box before sending your answers.";
  }

  const answers = input.answers ?? {};

  const fields: FieldCheck[] = CONTACT_FIELDS.map((id) => {
    const q = question(id);
    const label = (q?.label ?? id).toLowerCase();
    const value = answers[id];
    return {
      name: label,
      value: typeof value === "string" ? value : "",
      limit: SUBMISSION_LIMITS[id],
      required: q?.required ? `Fill in your ${label} before sending.` : undefined,
    };
  });

  const problem = checkLimits(fields, { includeRequired: true });
  if (problem) return problem;

  // Every other question the wizard marks required, so the server agrees with
  // what the form asked for rather than checking a shorter list of its own.
  for (const q of BASICS.questions) {
    if (!q.required || CONTACT_FIELDS.includes(q.id as ContactField)) continue;
    if (!hasText(answers[q.id])) {
      return `Fill in ${q.label.toLowerCase()} before sending.`;
    }
  }

  const email = typeof answers.email === "string" ? answers.email.trim() : "";
  // Cheap sanity check only. Anything stricter rejects addresses that work.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "That email address does not look right. Please check it.";
  }

  return null;
}
