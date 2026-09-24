/**
 * The length checks both halves of the CMS share.
 *
 * A plain module, not a `"use server"` one, so the editors can run the same
 * check in the browser that the Server Action runs before writing.
 */

/** What a save reports back to the editor. */
export type SaveState = { error: string | null };

export type FieldCheck = {
  /** How the field is named to the editor, read mid-sentence. */
  name: string;
  value: string;
  limit: number;
  /** The message shown when it is left blank. Omit for an optional field. */
  required?: string;
};

/**
 * The first problem in the list, worded for a non-technical editor, or null.
 * Fields are checked in the order they should be fixed.
 *
 * `includeRequired` is off for the editor's own live check: an empty field is
 * something you have not filled in yet, not something to grey Save out over,
 * whereas the server refuses to write it.
 */
export function checkLimits(
  fields: FieldCheck[],
  { includeRequired = false }: { includeRequired?: boolean } = {}
): string | null {
  for (const { name, value, limit, required } of fields) {
    if (includeRequired && required && !value.trim()) return required;
    if (value.length > limit) {
      return `The ${name} is ${value.length} characters; the limit is ${limit}.`;
    }
  }
  return null;
}
