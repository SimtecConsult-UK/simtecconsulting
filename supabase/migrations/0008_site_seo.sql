-- Search & AI visibility for the website itself.
--
-- The newsletter already carries its own meta title, description, key takeaway
-- and FAQ pairs per post (0001). Everything outside the newsletter — the
-- homepage, the newsletter index, the policies browser, the general terms — had
-- those words written into the page files, so changing one meant a deploy.
--
-- Two tables, because they answer two different questions:
--   site_settings  one row, the things that are true of the whole site: the
--                  favicon, the default share image, who the organisation is.
--   page_seo       one row per public page, holding only what has been
--                  customised. A page with no row keeps the wording committed
--                  in app/lib/seo/pages.ts, which is what the site shipped with.

-- ── Site-wide ────────────────────────────────────────────────────────────
-- A single row, forced by a primary key that can only ever hold `true`. The
-- alternative — a table anyone could add a second row to — means every read
-- has to decide which row is the real one.

create table public.site_settings (
  id                        boolean primary key default true check (id),

  -- The name appended to page titles and used as the organisation's name in
  -- structured data.
  site_name                 text not null default 'Simtec',

  -- The title and description a page falls back to when it has nothing of its
  -- own. Null means "use what is written in the code", so an empty table
  -- changes nothing about the live site.
  default_meta_title        text,
  default_meta_description  text,

  -- The browser-tab icon. An object path inside the site-assets bucket below;
  -- null leaves the committed /favicon.ico in place.
  favicon_path              text,

  -- The picture used when a page is shared on social media or in a chat app
  -- and has no picture of its own.
  social_image_path         text,
  social_image_width        integer,
  social_image_height       integer,

  -- Organisation details, emitted as JSON-LD on the homepage. This is the part
  -- AI assistants read when asked who Simtec is.
  org_legal_name            text,
  org_description           text,
  -- The company's other official profiles — LinkedIn, Companies House — as a
  -- plain array of URLs. schema.org calls this `sameAs`.
  org_same_as               jsonb not null default '[]'::jsonb,

  updated_at                timestamptz not null default now()
);

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- The one row, in its "nothing customised yet" state.
--
-- `org_legal_name` is the single seeded value. Every blog post's structured
-- data has always named its publisher "Simtec Consult Ltd", and that name now
-- comes from this column rather than from a string in the code — so seeding it
-- is what keeps the newsletter saying exactly what it said before. Everything
-- else is left null and falls back to the wording in app/lib/seo/.
insert into public.site_settings (id, org_legal_name)
values (true, 'Simtec Consult Ltd')
on conflict (id) do nothing;

-- ── Per page ─────────────────────────────────────────────────────────────

create table public.page_seo (
  id                uuid primary key default gen_random_uuid(),

  -- The page's address on the site, e.g. '/' or '/blog'. The editor only ever
  -- writes paths from the fixed list in app/lib/seo/pages.ts; the check is here
  -- so a stray row cannot claim a nonsense address.
  path              text not null unique check (path like '/%'),

  -- Search listing. Null means "fall back", first to site_settings and then to
  -- the wording in the code.
  meta_title        text,
  meta_description  text,

  -- The picture used when this page is shared. Falls back to the site-wide one.
  share_image_path  text,
  share_image_width  integer,
  share_image_height integer,

  -- Answer content — the same three fields the post editor calls "Search & AI
  -- visibility", because they do the same job here.
  key_takeaway      text,
  faqs              jsonb not null default '[]'::jsonb,
  schema_type       text not null default 'WebPage'
                      check (schema_type in ('WebPage', 'AboutPage', 'CollectionPage', 'Service')),

  -- Keeps the page out of search results. Off everywhere by default; it exists
  -- for pages that are published but not meant to be found.
  noindex           boolean not null default false,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger page_seo_touch_updated_at
  before update on public.page_seo
  for each row execute function public.touch_updated_at();

-- ── Access ───────────────────────────────────────────────────────────────
-- Both tables describe what the public site puts in its own <head>, so the
-- anon key reads them. Only signed-in editors write.

alter table public.site_settings enable row level security;
alter table public.page_seo enable row level security;

create policy "site settings are world readable"
  on public.site_settings for select
  to anon
  using (true);

create policy "signed-in editors manage site settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

create policy "page seo is world readable"
  on public.page_seo for select
  to anon
  using (true);

create policy "signed-in editors manage page seo"
  on public.page_seo for all
  to authenticated
  using (true)
  with check (true);

-- ── Asset storage ────────────────────────────────────────────────────────
-- Favicons and share images. Separate from blog-images because these belong to
-- the site rather than to any one post, and because a favicon is routinely an
-- .ico or an .svg, neither of which the blog bucket accepts.
--
-- SVG is allowed here and nowhere else: a favicon is commonly drawn as one, and
-- a file referenced by <link rel="icon"> is never executed as a document. It is
-- still served from the Supabase domain rather than ours, so markup inside it
-- cannot reach the site's own origin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml',
    'image/x-icon', 'image/vnd.microsoft.icon'
  ]
)
on conflict (id) do update
  set file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "site assets are world readable"
  on storage.objects for select
  to anon
  using (bucket_id = 'site-assets');

create policy "signed-in editors manage site assets"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'site-assets')
  with check (bucket_id = 'site-assets');
