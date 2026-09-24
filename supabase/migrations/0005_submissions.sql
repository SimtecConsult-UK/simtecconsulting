-- Discovery wizard submissions.
--
-- Until this table existed the wizard saved a draft to the visitor's own
-- browser and sent nothing anywhere, so a completed enquiry reached nobody.
--
-- The answers are stored exactly as the wizard holds them: `answers` keyed by
-- question id, `rep_rows` keyed by the id of each repeating question. The
-- questions themselves live in app/discovery/data.ts, and the CMS replays a
-- submission through the same renderer the wizard's own review sheet uses.
-- Storing the raw shape rather than a flattened copy means a submission can
-- still be read back in full after the questions change.
--
-- The contact columns are lifted out of `answers` so the list can be read and
-- sorted without unpacking JSON on every row.

create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Copied out of `answers` at insert. Capped because this table is the one
  -- thing on the site an anonymous visitor may write to.
  company       text check (length(company) <= 200),
  contact_name  text check (length(contact_name) <= 200),
  contact_role  text check (length(contact_role) <= 200),
  email         text check (length(email) <= 320),
  phone         text check (length(phone) <= 60),
  project_name  text check (length(project_name) <= 200),

  answers       jsonb not null default '{}'::jsonb,
  rep_rows      jsonb not null default '{}'::jsonb,

  -- The box ticked before submitting. Stored because it is the record of what
  -- the visitor agreed to, not a UI detail.
  consent       boolean not null default false,

  -- Set the first time an editor opens it, so the list can mark what is new.
  read_at       timestamptz,

  -- A whole submission is a few kilobytes of answers. The cap is a backstop
  -- against this public endpoint being used to store something else.
  constraint submissions_answers_size check (pg_column_size(answers) <= 262144),
  constraint submissions_rep_rows_size check (pg_column_size(rep_rows) <= 262144)
);

-- The list is always newest first.
create index submissions_created_idx on public.submissions (created_at desc);

-- ── Access ───────────────────────────────────────────────────────────────
-- The only table on the site an anonymous visitor may write to, and the only
-- one they may never read. Someone filling in the wizard needs to be able to
-- send it without an account; nobody may read back what anyone else sent.

alter table public.submissions enable row level security;

create policy "anyone may send a submission"
  on public.submissions for insert
  to anon
  with check (true);

create policy "signed-in editors manage submissions"
  on public.submissions for all
  to authenticated
  using (true)
  with check (true);
