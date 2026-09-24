"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * A Supabase client for Client Components — used for signing in and for
 * uploading files straight from the browser to storage, which keeps large
 * screen recordings from having to travel through the server.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
