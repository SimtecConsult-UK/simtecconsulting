import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { readHero } from "../../../lib/homepage/data";
import { DEFAULT_HERO, type HeroContent } from "../../../lib/homepage/types";

/**
 * The hero as the editor sees it.
 *
 * The read itself lives in `app/lib/homepage/data.ts` and is called here with
 * the cookie-bound client, so it runs as the signed-in editor. Sharing it
 * rather than restating the query is the point — the editor has to show exactly
 * what the live homepage will say, including how it falls back.
 */
export async function getHeroForEdit(): Promise<HeroContent> {
  if (!isSupabaseConfigured) return DEFAULT_HERO;
  return readHero(await createClient());
}
