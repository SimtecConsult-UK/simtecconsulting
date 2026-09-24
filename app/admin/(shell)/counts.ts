import { cache } from "react";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";

/** The shape `.select(..., { head: true })` returns, before it is awaited. */
type CountQuery = ReturnType<
  ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>["select"]
>;

/**
 * The badges beside each section in the sidebar.
 *
 * `head: true` asks Postgres for the row count without returning any rows, so
 * the badge costs a count rather than a full table read.
 */

async function countRows(
  table: string,
  /** Narrows what is counted — the submissions badge counts only the unread. */
  refine?: (query: CountQuery) => CountQuery
): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const supabase = await createClient();
  const base = supabase.from(table).select("*", { count: "exact", head: true });
  const { count, error } = await (refine ? refine(base) : base);

  if (error) {
    console.error(`[cms] count ${table}: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

export const countPosts = cache(() => countRows("posts"));
export const countCaseStudies = cache(() => countRows("case_studies"));

/**
 * Unread rather than total: this badge says what needs looking at, and a
 * submission that has been read needs nothing.
 */
export const countUnreadSubmissions = cache(() =>
  countRows("submissions", (query) => query.is("read_at", null))
);
