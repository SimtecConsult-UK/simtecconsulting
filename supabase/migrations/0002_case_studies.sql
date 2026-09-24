-- Homepage case studies.
--
-- The columns are the CMS "Case Study" content model from the handover, and
-- they line up with the CaseStudy type in app/lib/caseStudies.ts.
--
-- The character limits are checked here as well as in the editor. The editor
-- stops you saving and explains why; these constraints are the backstop, and
-- they exist because the section holds the height of the tallest chapter across
-- every client — one runaway field leaves white space under all the others.

create table public.case_studies (
  id            uuid primary key default gen_random_uuid(),

  -- Homepage order. The section renders the first three.
  position      integer not null,

  tab_label     text not null check (length(tab_label) between 1 and 22),
  headline      text not null check (length(headline) between 1 and 70),
  client_name   text not null check (length(client_name) between 1 and 40),
  system_name   text not null check (length(system_name) between 1 and 40),
  project_type  text not null check (length(project_type) between 1 and 120),

  -- Colour logo on a transparent background: it sits on white and on #f3f5ff.
  -- The dimensions are the file's own, passed to the <img> as a ratio hint.
  logo_path     text,
  logo_width    integer,
  logo_height   integer,

  -- 16:9, muted, loops. The poster shows before play, on reduced motion and on
  -- slow connections.
  video_path        text,
  video_poster_path text,

  -- Without quote marks; the design adds them. A blank line starts a new
  -- paragraph in the card.
  quote             text not null check (length(quote) between 1 and 260),
  quote_attribution text not null check (length(quote_attribution) between 1 and 40),

  -- { summary, problem, solution, value }, each
  -- { paragraphs: string[], bullets: string[], closing: string[] }.
  -- Held as JSON because the four chapters are one editable unit, always read
  -- and written together, and never queried across.
  chapters      jsonb not null default '{}'::jsonb,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Two case studies may not claim the same slot.
create unique index case_studies_position_idx on public.case_studies (position);

create trigger case_studies_touch_updated_at
  before update on public.case_studies
  for each row execute function public.touch_updated_at();

-- ── Access ───────────────────────────────────────────────────────────────
-- Case studies are homepage content: everyone may read them, only a signed-in
-- editor may change them. There is no draft state — the handover is explicit
-- that saving publishes.

alter table public.case_studies enable row level security;

create policy "case studies are world readable"
  on public.case_studies for select
  to anon
  using (true);

create policy "signed-in editors manage case studies"
  on public.case_studies for all
  to authenticated
  using (true)
  with check (true);

-- ── Media ────────────────────────────────────────────────────────────────
-- Logos, screen recordings and posters. Public read so the homepage can play
-- them; uploads and deletions require a signed-in editor.

insert into storage.buckets (id, name, public)
values ('case-study-media', 'case-study-media', true)
on conflict (id) do nothing;

create policy "case study media is world readable"
  on storage.objects for select
  to anon
  using (bucket_id = 'case-study-media');

create policy "signed-in editors manage case study media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'case-study-media')
  with check (bucket_id = 'case-study-media');
