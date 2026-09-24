import { SUPABASE_URL } from "./config";

/** The buckets created by the migrations in supabase/migrations. */
export const BUCKETS = {
  blogImages: "blog-images",
  caseStudyMedia: "case-study-media",
} as const;

export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * The path every public file sits under. next.config.ts reads this too, so the
 * shape next/image is told to allow cannot drift from the one built below.
 */
export const STORAGE_PUBLIC_PREFIX = "/storage/v1/object/public";

/**
 * The public URL of a stored file.
 *
 * Built by hand rather than through `supabase.storage.getPublicUrl()` so that
 * turning a path into a URL costs nothing and needs no client — it is a stable,
 * documented URL shape, and both buckets are public.
 *
 * Returns null for a missing path, which is how "no picture uploaded yet"
 * travels through to the components that draw a placeholder instead.
 */
export function publicUrl(bucket: Bucket, path: string | null): string | null {
  if (!path) return null;
  // A path starting with "/" is served from /public rather than storage. Not
  // a leftover: the seeded case studies deliberately point their logos and
  // recording at files in /public, so deleting this branch blanks both of them
  // on the homepage. Replacing either through the editor writes a storage key
  // and takes the branch below instead.
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${SUPABASE_URL}${STORAGE_PUBLIC_PREFIX}/${bucket}/${path}`;
}
