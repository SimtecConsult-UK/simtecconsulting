/**
 * Supabase connection details.
 *
 * Both values are public by design — the anon key ships to every visitor's
 * browser, and what protects the data is the row-level security in
 * supabase/migrations, not the secrecy of this key. The service-role key is
 * never used by the site and must never appear in this repository.
 */
/**
 * The trailing slash is stripped because storage URLs are built by joining onto
 * this value. A pasted "https://xyz.supabase.co/" would otherwise produce
 * "…co//storage/v1/…", whose path no longer matches the one next.config.ts
 * allows next/image to load — every picture on the site would fail, and the
 * error would point at next/image rather than at the typo.
 */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
  /\/$/,
  ""
);
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Whether the site has somewhere to read content from.
 *
 * Until the project is connected the blog and the case studies fall back to
 * the sample content committed in the repo, so `npm run dev` works on a fresh
 * clone and a missing environment variable never takes the homepage down.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
