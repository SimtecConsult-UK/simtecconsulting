import type { NextConfig } from "next";

/**
 * Cover images and case-study media are served from Supabase Storage, so
 * next/image has to be told that host is allowed. It is derived from the same
 * environment variable the rest of the app uses, rather than hardcoded, so
 * preview and production can point at different projects.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
