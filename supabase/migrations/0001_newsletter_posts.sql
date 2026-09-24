-- Newsletter posts — the collection behind /blog.
--
-- The columns are the fields of the post editor in the Simtec CMS handover
-- ("case studies and cms/Simtec CMS.dc.html", the Newsletter section), and
-- they line up with the Post type in app/lib/blog/types.ts.
--
-- Run this against the Supabase project before pointing the site at it.

create extension if not exists "pgcrypto";

create table public.posts (
  id            uuid primary key default gen_random_uuid(),

  -- Search listing
  slug          text not null unique,
  title         text not null,
  standfirst    text not null,

  -- Body, stored as the BlogBlock[] the site renders. Keeping it as JSON
  -- rather than HTML means the front end never has to trust or sanitise
  -- markup coming out of the editor.
  body          jsonb not null default '[]'::jsonb,

  -- Cover image. cover_path is an object path inside the storage bucket below,
  -- and stays null until a picture is uploaded — the site then draws the
  -- design's striped placeholder in its place.
  cover_path    text,
  cover_alt     text not null default '',
  cover_width   integer,
  cover_height  integer,

  status        text not null default 'draft'
                  check (status in ('draft', 'published')),
  published_at  date,

  -- Search & AI visibility panel
  meta_title        text,
  meta_description  text,
  key_takeaway      text,
  faqs              jsonb not null default '[]'::jsonb,
  schema_type       text not null default 'Article'
                      check (schema_type in ('Article', 'NewsArticle', 'HowTo')),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A post cannot go live without the date the index and the post page sort
  -- and display it by.
  constraint posts_published_needs_date
    check (status <> 'published' or published_at is not null)
);

-- The index page's only query: published posts, newest first.
create index posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ── Access ───────────────────────────────────────────────────────────────
-- Anonymous visitors (the website) may read published posts and nothing else.
-- Drafts are invisible to the anon key, so an unfinished post cannot leak by
-- someone guessing its URL. Signed-in CMS users may do everything.

alter table public.posts enable row level security;

create policy "published posts are world readable"
  on public.posts for select
  to anon
  using (status = 'published');

create policy "signed-in editors manage every post"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

-- ── Image storage ────────────────────────────────────────────────────────
-- Public read so next/image can fetch covers; uploads and deletions require a
-- signed-in editor.

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "blog images are world readable"
  on storage.objects for select
  to anon
  using (bucket_id = 'blog-images');

create policy "signed-in editors manage blog images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');
