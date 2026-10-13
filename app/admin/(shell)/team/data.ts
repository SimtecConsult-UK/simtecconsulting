import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { readTeamPhotos } from "../../../lib/homepage/data";
import { TEAM_SLOTS, committedPhoto, type TeamPhoto } from "../../../lib/homepage/types";

/**
 * The five tiles as the editor sees them — the same read the homepage makes,
 * run as the signed-in editor. Always five, with the committed photo standing
 * in wherever nothing has been uploaded, so the editor sees the page as it is
 * rather than four empty boxes.
 */
export async function getTeamPhotosForEdit(): Promise<TeamPhoto[]> {
  if (!isSupabaseConfigured) return TEAM_SLOTS.map(committedPhoto);
  return readTeamPhotos(await createClient());
}
