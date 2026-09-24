import { blocksLength } from "../../../lib/blog/html";
import { checkLimits, type FieldCheck } from "../../validation";
import type { PostInput } from "./actions";

/**
 * The newsletter's character limits, kept out of `actions.ts` because a
 * `"use server"` file may only export async functions — every other export is
 * turned into a server reference, so a client that imported `LIMITS` from there
 * would get a call handle instead of the numbers and every counter would read
 * "124 / ". The editor needs the real values to draw its counters.
 */
export const LIMITS = {
  title: 90,
  standfirst: 260,
  metaTitle: 60,
  metaDescription: 160,
  keyTakeaway: 300,
  body: 20000,
} as const;

/** Every capped field, in the order an editor should fix them. */
function fields(input: PostInput): FieldCheck[] {
  return [
    { name: "title", value: input.title, limit: LIMITS.title, required: "Give the post a title before saving." },
    { name: "standfirst", value: input.standfirst, limit: LIMITS.standfirst, required: "Write a standfirst — it is the summary on the index and the opening line of the post." },
    { name: "meta title", value: input.metaTitle, limit: LIMITS.metaTitle },
    { name: "meta description", value: input.metaDescription, limit: LIMITS.metaDescription },
    { name: "key takeaway", value: input.keyTakeaway, limit: LIMITS.keyTakeaway },
  ];
}

function bodyTooLong(input: PostInput, length = blocksLength(input.body)): string | null {
  if (length > LIMITS.body) {
    return `The body is ${length} characters; the limit is ${LIMITS.body}.`;
  }
  return null;
}

/**
 * Only the too-long problems. The editor greys Save out on this and shows the
 * sentence, so it says the same thing the server would have said.
 */
export function postTooLong(
  input: PostInput,
  /** The editor already counts the body for its own counter; reuse that. */
  bodyLength?: number
): string | null {
  return checkLimits(fields(input)) ?? bodyTooLong(input, bodyLength);
}

/**
 * Everything that must be true before a post can be written. Lives here rather
 * than in `actions.ts` so the editor shares the list above.
 */
export function validatePost(input: PostInput): string | null {
  const problem =
    checkLimits(fields(input), { includeRequired: true }) ?? bodyTooLong(input);
  if (problem) return problem;

  if (input.status === "published" && input.body.length === 0)
    return "A published post needs some body text.";
  if (input.status === "published" && !input.coverPath)
    return "A published post needs a cover image — the index and the article both lead with it.";

  return null;
}
