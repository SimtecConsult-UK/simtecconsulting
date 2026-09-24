import { SECTIONS, hasText, sanitizeAnswers, type Answers, type RepRow } from "./data";
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
 * Keyed by question id. TypeScript cannot check those keys against `SECTIONS`
 * — the questions are a plain array, so their ids are strings rather than
 * literal types — so `CONTACT_QUESTIONS` below checks them when this module
 * loads instead.
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

/**
 * The question behind each contact field, resolved once when this module is
 * first imported — which is during `next build`, since the wizard imports it.
 *
 * Resolved eagerly and loudly on purpose. Renaming (say) `email` in data.ts
 * without renaming it here would otherwise leave `question(id)` returning
 * undefined, and the checks below read required-ness and the field's label off
 * that question: the server would quietly stop insisting on an email address
 * and start calling it "email" in its error messages. A failed build is a far
 * cheaper way to find out.
 */
const CONTACT_QUESTIONS = new Map(
  CONTACT_FIELDS.map((id) => {
    const question = BASICS.questions.find((q) => q.id === id);
    if (!question) {
      throw new Error(
        `[discovery] SUBMISSION_LIMITS names "${id}", which is not a question in ` +
          `"${BASICS.name}". Rename it in app/discovery/data.ts and here together.`
      );
    }
    return [id, question] as const;
  })
);

/**
 * Every key the wizard can legitimately put in `answers`: one per question,
 * plus the `<questionId>.<fieldKey>` pairs a `group` question stores its parts
 * under (see the group branch of `getReviewValue`).
 */
const ANSWER_KEYS = new Set(
  SECTIONS.flatMap((section) =>
    section.questions.flatMap((question) => [
      question.id,
      ...(question.fields ?? []).map((field) => `${question.id}.${field.key}`),
    ])
  )
);

/**
 * The cell keys each repeating question's rows may carry. `__`-prefixed keys
 * (`__key`, `__group`, `__<column>Kind`) are structural bookkeeping and are
 * allowed everywhere; everything else has to be a column the question declares.
 */
const REP_COLUMNS = new Map(
  SECTIONS.flatMap((section) => section.questions)
    .filter((question) => question.type === "rep")
    .map((question) => [question.id, new Set((question.columns ?? []).map((c) => c.key))])
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A string, or a list with the non-strings dropped. Anything else is not an answer. */
function coerceCell(value: unknown): string | string[] | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return null;
}

/**
 * Forces a payload into the shapes the rest of the site assumes.
 *
 * `SubmissionInput` describes what the wizard sends, not what can arrive:
 * `submitDiscovery` is public, so the payload is whatever somebody chose to
 * post, and a type annotation checks nothing at runtime. That matters because
 * these values are read back through `buildReviewData`, which calls `.some`,
 * `.includes` and `.filter` on them — a number where a list belongs throws
 * there rather than here, and the page it throws on is the only one from which
 * a submission can be read or deleted.
 *
 * So anything that is not a string or a list of strings is dropped, as is any
 * key the wizard could not have written. `sanitizeAnswers` then settles the
 * remaining string-vs-list question per the question's own type, and because
 * this runs before validation, the values checked are the values stored.
 */
export function coerceSubmission(input: SubmissionInput): SubmissionInput {
  return {
    answers: sanitizeAnswers(coerceAnswers(input?.answers)),
    repRows: coerceRepRows(input?.repRows),
    consent: input?.consent === true,
  };
}

function coerceAnswers(raw: unknown): Answers {
  if (!isRecord(raw)) return {};

  const answers: Answers = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!ANSWER_KEYS.has(key)) continue;
    const cell = coerceCell(value);
    if (cell !== null) answers[key] = cell;
  }
  return answers;
}

function coerceRepRows(raw: unknown): Record<string, RepRow[]> {
  if (!isRecord(raw)) return {};

  const repRows: Record<string, RepRow[]> = {};
  for (const [id, rows] of Object.entries(raw)) {
    const columns = REP_COLUMNS.get(id);
    if (!columns || !Array.isArray(rows)) continue;

    repRows[id] = rows.filter(isRecord).map((raw) => {
      const row: RepRow = {};
      for (const [key, value] of Object.entries(raw)) {
        if (!key.startsWith("__") && !columns.has(key)) continue;
        const cell = coerceCell(value);
        if (cell !== null) row[key] = cell;
      }
      return row;
    });
  }
  return repRows;
}

/**
 * Everything that must be true before a submission can be written. Call it on
 * a `coerceSubmission` result, so what is checked is what will be stored.
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
    const question = CONTACT_QUESTIONS.get(id)!;
    const label = question.label.toLowerCase();
    const value = answers[id];
    return {
      name: label,
      value: typeof value === "string" ? value : "",
      limit: SUBMISSION_LIMITS[id],
      required: question.required ? `Fill in your ${label} before sending.` : undefined,
    };
  });

  const problem = checkLimits(fields, { includeRequired: true });
  if (problem) return problem;

  // Every other Project Basics question the wizard marks required, so the
  // server agrees with what the form asked for rather than checking a shorter
  // list of its own. Later sections are deliberately not enforced here: an
  // enquiry missing question 41 is still an enquiry worth receiving.
  for (const question of BASICS.questions) {
    if (!question.required || CONTACT_FIELDS.includes(question.id as ContactField)) continue;
    if (!hasText(answers[question.id])) {
      return `Fill in ${question.label.toLowerCase()} before sending.`;
    }
  }

  const email = typeof answers.email === "string" ? answers.email.trim() : "";
  // Cheap sanity check only. Anything stricter rejects addresses that work.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "That email address does not look right. Please check it.";
  }

  return null;
}
