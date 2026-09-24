/**
 * Supabase connection details.
 *
 * Both values are public by design — the anon key ships to every visitor's
 * browser, and what protects the data is the row-level security in
 * supabase/migrations, not the secrecy of this key. The service-role key is
 * never used by the site and must never appear in this repository.
 */

/**
 * Trimmed, and trailing slashes removed: storage URLs are built by joining onto
 * this, and "…supabase.co//storage/v1/…" stops matching the path next.config.ts
 * lets next/image load from, which breaks every picture on the site.
 */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Whether the site has somewhere to read content from.
 *
 * Every read checks this first because `createClient` throws when handed an
 * empty URL, which would take the build down rather than the one page.
 *
 * Without a project the blog serves the samples committed in `content.ts`, so
 * `npm run dev` works on a fresh clone. Case studies have no such copy — they
 * come only from the database, so the homepage leaves the section out.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
