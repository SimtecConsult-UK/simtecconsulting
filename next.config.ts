import type { NextConfig } from "next";
import { SUPABASE_URL } from "./app/lib/supabase/config";
import { STORAGE_PUBLIC_PREFIX } from "./app/lib/supabase/storage";

/**
 * Cover images and case-study media are served from Supabase Storage, so
 * next/image has to be told that host is allowed. Both the host and the path
 * come from the same modules the rest of the app uses, rather than being
 * written out again here, so preview and production can point at different
 * projects and the allowed path cannot drift from the one publicUrl() builds.
 */
const supabaseHost = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: `${STORAGE_PUBLIC_PREFIX}/**`,
          },
        ]
      : [],
  },
};

export default nextConfig;
