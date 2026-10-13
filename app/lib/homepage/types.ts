/**
 * The two homepage sections the CMS edits directly: the hero and the band of
 * team photos.
 *
 * Everything here has a fallback, and the fallbacks are the exact words and
 * files the homepage carried before these became editable. A fresh clone with
 * no Supabase project, or a database nobody has opened the CMS against, renders
 * the page unchanged — the same promise `app/lib/seo/types.ts` makes.
 */

/** One entry in a `<video>`'s list of sources. */
export type VideoSource = { src: string; type?: string };

/**
 * The hero's recording, resolved for both the page and the editor.
 *
 * `sources` is what the `<video>` renders, and is always the right list: one
 * entry for a file uploaded in the CMS, two for the committed recording, which
 * ships as WebM with an MP4 beside it for browsers that cannot read WebM. The
 * component draws it without knowing which it got — the same bargain
 * `caseStudiesData.ts` makes with `publicUrl()`. `path` and `url` are the
 * editor's half: what is stored, and what to preview.
 */
export type HeroVideo = {
  path: string | null;
  url: string | null;
  sources: VideoSource[];
};

/** The two files the hero has always played, in the order a browser tries them. */
const COMMITTED_HERO_VIDEO: VideoSource[] = [
  { src: "/simtechero.webm", type: "video/webm" },
  { src: "/simtechero.mp4", type: "video/mp4" },
];

/** A stored path and its public URL, resolved into what the `<video>` needs. */
export function heroVideo(path: string | null, url: string | null): HeroVideo {
  return { path, url, sources: url ? [{ src: url }] : COMMITTED_HERO_VIDEO };
}

/** The hero's wording and its screen recording. */
export type HeroContent = {
  /** The first, white part of the headline. */
  headlineLead: string;
  /**
   * The ending, drawn in the brand blue. The component puts a space between
   * the two, so neither field carries one. May be blank, for a headline in a
   * single colour.
   */
  headlineAccent: string;
  /** The paragraph under the headline. */
  subhead: string;
  /** The wording on the button. Where it points is fixed; see BOOKING_URL. */
  ctaLabel: string;
  /** The recording inside the browser mock-up. */
  video: HeroVideo;
};

/**
 * What the hero says with nothing customised — the markup that was in
 * `Hero.tsx` before this existed, lifted word for word.
 */
export const DEFAULT_HERO: HeroContent = {
  headlineLead: "Construction software built to work",
  headlineAccent: "the way you do.",
  subhead:
    "We partner with construction, environmental and infrastructure businesses to understand how you work, then engineer bespoke systems that fit your operation perfectly.",
  ctaLabel: "Book a Workshop",
  video: heroVideo(null, null),
};

/**
 * One tile in the team band.
 *
 * The band is a fixed design — one wide photo, then four square ones — so the
 * slots are listed here rather than being a list the CMS can add to. A sixth
 * photo would have nowhere to go.
 */
export type TeamSlot = {
  /** Matches `team_photos.slot`. */
  slot: number;
  /** How the tile is named in the CMS. */
  name: string;
  /** One line saying where on the page this tile is. */
  blurb: string;
  /** The photo committed in /public, shown until one is uploaded. */
  fallbackSrc: string;
  fallbackAlt: string;
};

export const TEAM_SLOTS: TeamSlot[] = [
  {
    slot: 1,
    name: "Main photo",
    blurb: "The wide photo across the top of the section.",
    fallbackSrc: "/team-photos/1.jpeg",
    fallbackAlt: "The Simtec team",
  },
  {
    slot: 2,
    name: "Tile 1",
    blurb: "First of the four squares, far left.",
    fallbackSrc: "/team-photos/2.jpeg",
    fallbackAlt: "Simtec team member 2",
  },
  {
    slot: 3,
    name: "Tile 2",
    blurb: "Second square from the left.",
    fallbackSrc: "/team-photos/3.jpeg",
    fallbackAlt: "Simtec team member 3",
  },
  {
    slot: 4,
    name: "Tile 3",
    blurb: "Third square from the left.",
    fallbackSrc: "/team-photos/4.jpeg",
    fallbackAlt: "Simtec team member 4",
  },
  {
    slot: 5,
    name: "Tile 4",
    blurb: "Last of the four squares, far right.",
    fallbackSrc: "/team-photos/5.jpeg",
    fallbackAlt: "Simtec team member 5",
  },
];

/** A tile as the page draws it: whatever is stored, or what shipped. */
export type TeamPhoto = {
  slot: number;
  /** The stored object path, or null while the committed photo is in use. */
  path: string | null;
  src: string;
  alt: string;
};

/** The tile as it looks with nothing uploaded for it. */
export function committedPhoto(slot: TeamSlot): TeamPhoto {
  return { slot: slot.slot, path: null, src: slot.fallbackSrc, alt: slot.fallbackAlt };
}
