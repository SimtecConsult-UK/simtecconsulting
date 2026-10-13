-- The two homepage sections that were still written into the code: the hero at
-- the top of the page, and the band of team photos below the module picker.
--
-- Same shape as 0008: a row means "somebody has changed this", and no row — or
-- a null column — means the live site keeps exactly what it shipped with. The
-- fallbacks live in app/lib/homepage/types.ts, so an empty database renders the
-- homepage byte for byte as it was before this migration.
--
--   homepage_hero  one row, the headline, the sub-heading, the button label
--                  and the screen recording inside the browser mock-up.
--   team_photos    one row per tile in the team band, keyed by its slot.

-- ── Hero ─────────────────────────────────────────────────────────────────
-- A single row, pinned the same way site_settings is: a primary key that can
-- only hold `true`, so there is never a second row to choose between.

create table public.homepage_hero (
  id                 boolean primary key default true check (id),

  -- The headline is drawn in two colours. `headline_lead` is the white part and
  -- `headline_accent` the blue ending; they are two columns rather than one
  -- string with markup in it, because that is the only variation the design has
  -- and an editor should not have to type a tag to get it.
  headline_lead      text,
  headline_accent    text,

  -- The paragraph under the headline.
  subhead            text,

  -- The wording on the button. Where it points is not editable: every "Book a
  -- Workshop" button on the site shares one address, held in app/lib/sections.ts.
  cta_label          text,

  -- The screen recording inside the browser mock-up, as an object path in the
  -- site-assets bucket. Null leaves the committed /simtechero.webm in place,
  -- which is also the only version with an MP4 fallback for older browsers.
  video_path         text,

  updated_at         timestamptz not null default now()
);

create trigger homepage_hero_touch_updated_at
  before update on public.homepage_hero
  for each row execute function public.touch_updated_at();

-- The one row, with every column null: nothing customised yet.
insert into public.homepage_hero (id)
values (true)
on conflict (id) do nothing;

-- ── Team photos ──────────────────────────────────────────────────────────
-- The band is a fixed design: one wide photo across the top and four square
-- tiles under it. So the table is five numbered slots rather than a list that
-- can grow — adding a sixth row would have nowhere to be drawn.
--
-- A slot with no row shows the photo committed in /public/team-photos, which is
-- what "Remove" goes back to.

create table public.team_photos (
  -- 1 is the wide photo at the top; 2–5 are the grid underneath, left to right.
  slot        integer primary key check (slot between 1 and 5),

  -- An object path inside the site-assets bucket. Not null: a row exists only
  -- because a photo was uploaded for that slot.
  path        text not null,

  -- What a screen reader says about the photo. Optional — blank falls back to
  -- the wording in the component.
  alt         text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger team_photos_touch_updated_at
  before update on public.team_photos
  for each row execute function public.touch_updated_at();

-- ── Access ───────────────────────────────────────────────────────────────
-- Both tables are read by the homepage, so the anon key reads them. Only
-- signed-in editors write.

alter table public.homepage_hero enable row level security;
alter table public.team_photos enable row level security;

create policy "homepage hero is world readable"
  on public.homepage_hero for select
  to anon
  using (true);

create policy "signed-in editors manage the homepage hero"
  on public.homepage_hero for all
  to authenticated
  using (true)
  with check (true);

create policy "team photos are world readable"
  on public.team_photos for select
  to anon
  using (true);

create policy "signed-in editors manage team photos"
  on public.team_photos for all
  to authenticated
  using (true)
  with check (true);

-- ── Storage ──────────────────────────────────────────────────────────────
-- Both live in site-assets, the bucket 0008 created for files that belong to
-- the site rather than to any one post or case study — which is exactly what
-- the hero recording and the team photos are.
--
-- Two changes to it: the size limit goes from 5 MB to the 15 MB the case-study
-- bucket allows, and MP4/WebM are accepted, because the hero recording is a
-- video. The editor refuses anything over 15 MB before it is uploaded; this is
-- the same ceiling enforced by storage itself.
--
-- Stated in full, as 0002 and 0008 state their buckets, rather than as an
-- UPDATE of what 0008 left behind. A bare UPDATE that matches no row raises no
-- error, so on a database where this bucket is missing — deleted and recreated
-- by hand, or a partial migration run — the migration would report success and
-- the first upload would fail instead, a long way from the cause. (The access
-- policies for it are 0008's and are not repeated.)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  15728640,
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml',
    'image/x-icon', 'image/vnd.microsoft.icon',
    'video/mp4', 'video/webm'
  ]
)
on conflict (id) do update
  set file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
