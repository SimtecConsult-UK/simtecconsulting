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
--
-- Deferrable, so the check happens when the transaction commits rather than
-- after each statement. Swapping two rows means both briefly hold the other's
-- slot; with an immediate constraint the first update would collide, which is
-- why reordering used to park a row on a negative slot first.
alter table public.case_studies
  add constraint case_studies_position_key unique (position)
  deferrable initially deferred;

-- Swaps a case study with its neighbour, in one transaction.
--
-- Doing this in the database rather than as three writes from the server means
-- a reorder either happens completely or not at all: it cannot fail halfway and
-- leave the homepage in an order nobody chose. SECURITY INVOKER, so the caller's
-- row-level security still applies and only a signed-in editor may reorder.
create function public.move_case_study(target uuid, direction text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  mover     public.case_studies%rowtype;
  neighbour public.case_studies%rowtype;
begin
  select * into mover from public.case_studies where id = target;
  if not found then
    return;
  end if;

  if direction = 'up' then
    select * into neighbour from public.case_studies
     where position < mover.position
     order by position desc
     limit 1;
  else
    select * into neighbour from public.case_studies
     where position > mover.position
     order by position asc
     limit 1;
  end if;

  -- Already at the top or the bottom; nothing to swap with.
  if not found then
    return;
  end if;

  update public.case_studies set position = neighbour.position where id = mover.id;
  update public.case_studies set position = mover.position where id = neighbour.id;
end;
$$;

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

-- The size and type limits are enforced here as well as in the editor. The
-- editor's checks (app/admin/(shell)/case-studies/video-checks.ts) explain what
-- is wrong in plain words; these are the backstop, so a browser that skipped
-- them cannot put a 400 MB file in the bucket. 15 MB matches VIDEO_SPEC.maxBytes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-study-media',
  'case-study-media',
  true,
  15728640,
  array['video/mp4', 'video/webm', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
  set file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "case study media is world readable"
  on storage.objects for select
  to anon
  using (bucket_id = 'case-study-media');

create policy "signed-in editors manage case study media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'case-study-media')
  with check (bucket_id = 'case-study-media');
