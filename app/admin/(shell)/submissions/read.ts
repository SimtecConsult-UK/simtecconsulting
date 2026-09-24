import type { createClient } from "../../../lib/supabase/server";

/**
 * Marking a submission read, kept out of `actions.ts` on purpose.
 *
 * It takes an already-built Supabase client rather than making its own, because
 * its one caller runs it inside `after()`. A Server Component's `after`
 * callback runs once React has finished rendering, and Next refuses to hand out
 * request data — cookies, headers — from there; building the client needs the
 * session cookie, so the page builds it during its own render and passes it in.
 *
 * That also means this cannot live in `actions.ts`: a `"use server"` export is
 * a public endpoint, and a Supabase client is not something to accept across
 * one. Authorisation happens in the page, for the same reason — before `after`,
 * where `requireEditor()` can still read the session — and behind all of it
 * sits the table's own row-level security.
 */
export async function markSubmissionRead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
) {
  const { error } = await supabase
    .from("submissions")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    console.error(`[cms] mark submission ${id} read: ${error.message}`);
  }
}
