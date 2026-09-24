import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

/**
 * Who may edit the site.
 *
 * This is the security boundary, not proxy.ts. Every admin page and every
 * write calls `requireEditor()` first, so a request that somehow skips the
 * proxy — a prefetch, a direct Server Action call, a bug in a framework
 * version — still cannot reach the editor or change anything.
 *
 * Behind this sits the database's own row-level security, which is what
 * actually refuses the write. Signing in is how someone becomes `authenticated`
 * to Postgres; these functions only decide what to show and where to redirect.
 */

/**
 * The signed-in editor, or null.
 *
 * `getUser()` verifies the token with Supabase rather than trusting the
 * cookie's contents. `cache` keeps one render pass from asking twice.
 */
export const getEditor = cache(async () => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/** The same check, but it sends anyone who is not signed in to the sign-in page. */
export async function requireEditor() {
  const editor = await getEditor();
  if (!editor) redirect("/admin/login");
  return editor;
}
