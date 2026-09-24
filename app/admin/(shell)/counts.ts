import { cache } from "react";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";

/**
 * The badges beside each section in the sidebar.
 *
 * `head: true` asks Postgres for the row count without returning any rows, so
 * the badge costs a count rather than a full table read.
 */

async function countRows(table: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(`[cms] count ${table}: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

export const countPosts = cache(() => countRows("posts"));
export const countCaseStudies = cache(() => countRows("case_studies"));
