import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * A Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * It reads the signed-in editor's session from the request cookies, so every
 * query it makes is subject to that person's row-level security — an anonymous
 * visitor sees only published content, an editor sees everything.
 *
 * `cache` makes that one client per request rather than one per call — a
 * single admin page asks for four. It must never become a module-level
 * constant: that would share one person's session with every other request the
 * server handles, which is exactly what React's per-request cache avoids.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components may not set cookies. The proxy refreshes the
          // session on every request, so nothing is lost by ignoring this.
        }
      },
    },
  });
});
