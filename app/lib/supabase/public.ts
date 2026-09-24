import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * A Supabase client for the public website — the blog and the homepage.
 *
 * It carries no session and reads no cookies, which matters for two reasons:
 *
 *  - `generateStaticParams` runs at build time with no HTTP request at all, so
 *    a cookie-reading client throws there outright.
 *  - A page that reads cookies is opted out of static rendering. The public
 *    pages are meant to be prerendered and revalidated on a timer, not
 *    re-rendered for every visitor.
 *
 * Nothing is lost by dropping the session: these reads only ever want
 * published content, which row-level security exposes to the anonymous key
 * anyway. The cookie-bound client in `server.ts` stays for the admin area,
 * where the editor's session is the whole point.
 */
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // There is no user here and nothing to persist or refresh.
    persistSession: false,
    autoRefreshToken: false,
  },
});
