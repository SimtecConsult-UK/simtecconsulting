import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../supabase/config";
import { supabasePublic } from "../supabase/public";
import { BUCKETS, publicUrl } from "../supabase/storage";
import {
  DEFAULT_HERO,
  TEAM_SLOTS,
  committedPhoto,
  heroVideo,
  type HeroContent,
  type TeamPhoto,
} from "./types";

/**
 * Where the homepage's hero and team photos come from.
 *
 * Written the way `app/lib/seo/data.ts` is, and for the same reason: the reads
 * take a Supabase client rather than making one, so the public site can run
 * them with the anonymous key and the CMS can run the very same query as the
 * signed-in editor. The editor's job is to show what the live page will say, so
 * the two must not be able to disagree about a fallback.
 */

type HeroRow = {
  headline_lead: string | null;
  headline_accent: string | null;
  subhead: string | null;
  cta_label: string | null;
  video_path: string | null;
};

type TeamPhotoRow = {
  slot: number;
  path: string;
  alt: string | null;
};

const HERO_COLUMNS = "headline_lead,headline_accent,subhead,cta_label,video_path";
const TEAM_PHOTO_COLUMNS = "slot,path,alt";

/**
 * Null is the only thing that falls back, and it means "never written" — the
 * four wording columns are nulled together by "Reset the wording" and written
 * together by Save, so they are either all untouched or all the editor's.
 *
 * A stored empty string is therefore a deliberate blank and is kept, which is
 * what allows a headline with no coloured ending. Everything else in the CMS
 * reads a blank column as "unset" (see `orNull` in `app/lib/seo/data.ts`); the
 * hero differs because its committed wording would otherwise reappear under an
 * editor who had deliberately cleared a field.
 */
function toHero(row: HeroRow): HeroContent {
  return {
    headlineLead: row.headline_lead ?? DEFAULT_HERO.headlineLead,
    headlineAccent: row.headline_accent ?? DEFAULT_HERO.headlineAccent,
    subhead: row.subhead ?? DEFAULT_HERO.subhead,
    ctaLabel: row.cta_label ?? DEFAULT_HERO.ctaLabel,
    video: heroVideo(row.video_path, publicUrl(BUCKETS.siteAssets, row.video_path)),
  };
}

export async function readHero(supabase: SupabaseClient): Promise<HeroContent> {
  const { data, error } = await supabase.from("homepage_hero").select(HERO_COLUMNS).maybeSingle();

  if (error) {
    console.error(`[homepage] hero: ${error.message}`);
    return DEFAULT_HERO;
  }
  return data ? toHero(data as HeroRow) : DEFAULT_HERO;
}

/**
 * All five tiles, in the order they are drawn, with the committed photo
 * standing in wherever nothing has been uploaded. Always five entries, so the
 * component never has to decide what an absent tile looks like.
 */
export async function readTeamPhotos(supabase: SupabaseClient): Promise<TeamPhoto[]> {
  const { data, error } = await supabase.from("team_photos").select(TEAM_PHOTO_COLUMNS);

  if (error) {
    console.error(`[homepage] team photos: ${error.message}`);
    return TEAM_SLOTS.map(committedPhoto);
  }

  const stored = new Map((data as TeamPhotoRow[]).map((row) => [row.slot, row]));

  return TEAM_SLOTS.map((slot) => {
    const row = stored.get(slot.slot);
    const url = publicUrl(BUCKETS.siteAssets, row?.path ?? null);
    // A row whose path somehow resolves to nothing falls back rather than
    // rendering an empty tile, which on this section is a grey hole.
    if (!row || !url) return committedPhoto(slot);

    // A blank description means "unset" here, as everywhere outside the hero.
    return { slot: slot.slot, path: row.path, src: url, alt: row.alt?.trim() || slot.fallbackAlt };
  });
}

/**
 * The hero as the homepage reads it. No project configured — a fresh clone, a
 * preview without environment variables — gives the committed wording, exactly
 * as the page behaved before the CMS reached it.
 */
export const getHero = cache(async (): Promise<HeroContent> => {
  if (!isSupabaseConfigured) return DEFAULT_HERO;
  return readHero(supabasePublic());
});

/** The team photos as the homepage reads them. */
export const getTeamPhotos = cache(async (): Promise<TeamPhoto[]> => {
  if (!isSupabaseConfigured) return TEAM_SLOTS.map(committedPhoto);
  return readTeamPhotos(supabasePublic());
});
