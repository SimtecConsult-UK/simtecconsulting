# Supabase — the content manager's database

The content manager at `/admin` reads and writes two collections here:
newsletter posts (the blog) and homepage case studies.

## What is here

| File | What it creates |
|---|---|
| `migrations/0001_newsletter_posts.sql` | The `posts` table, its access rules and the `blog-images` bucket |
| `migrations/0002_case_studies.sql` | The `case_studies` table, its access rules and the `case-study-media` bucket |

The columns are the fields of the editors in the CMS handover, one for one.

## Setting it up

1. **Create the project** at supabase.com. Note its region — pick one close to
   your visitors.

2. **Run the migrations**, in order, in the project's SQL editor
   (Database → SQL Editor → New query). Paste `0001` and run it, then `0002`.

3. **Create the one editor account.** Authentication → Users → Add user. Give
   it the email you want to sign in with, set a password, and tick
   "Auto Confirm User" so no confirmation email is needed. Nobody can sign up
   themselves — there is no sign-up form, and this is the only account.

   To be certain, also turn off Authentication → Providers → Email →
   "Enable email signups".

4. **Set the environment variables.** Copy `.env.example` to `.env.local` for
   local work, and add the same two values on Vercel under Project → Settings →
   Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

   Both are in the dashboard under Project Settings → API. They are public by
   design — the anon key is sent to every visitor's browser. **The
   `service_role` key is not used by this site and must never be added.**

5. **Redeploy**, then sign in at `/admin`.

## How the data is protected

Row-level security is on for both tables, and the site only ever connects with
the anon key. That key can:

- read **published** posts, and nothing else from `posts` — a draft is
  invisible even to somebody who guesses its address;
- read case studies;
- read files in both buckets.

Every write, and any sight of a draft, requires a signed-in session. The same
rule is enforced three times over: the proxy redirects signed-out visitors, and
`requireEditor()` runs in the admin layout and again inside every save action,
because a Server Action is a public endpoint. Postgres itself refuses the write
regardless.

Both buckets also cap what they will accept — 10 MB of image for `blog-images`,
15 MB of image or MP4/WebM for `case-study-media`. The editor checks a file
before uploading it and explains what is wrong in plain words; these caps are
the backstop, so the limits hold even if that check is bypassed.

## Moving the existing content in

The site ships with content committed in the repository — sample blog posts in
`app/lib/blog/content.ts` and the two real case studies in
`app/lib/caseStudies.ts`. The two fall back differently, on purpose:

- the **blog** serves the committed samples only while no Supabase project is
  configured at all — on a fresh clone, so `npm run dev` works. Once a project
  is configured it never falls back: a failed read shows the blog's own empty
  state, because lorem ipsum appearing on the live site would be worse than an
  empty page.
- the **homepage** serves the committed case studies whenever the database has
  none to give — no project configured, a failed read, or an empty table. That
  content is the real thing rather than placeholder text, and the section is a
  permanent part of the homepage, so the last known-good version beats a hole
  in the page.

Once you add real content through `/admin`, the database wins. Note the
consequence of the homepage rule: deleting the last case study brings the
committed ones back. They can be deleted from the repository later, once every
case study has been re-entered.

The two real case studies have to be re-entered by hand through the editor,
because their logos and recordings need uploading to storage — there is no
import that can do that part.

## What is deliberately not here yet

**Submissions** and **Policies**, the other two sections in the CMS handover.

- Submissions has no data to show: the discovery wizard does not currently save
  anything anywhere, so that has to be built first.
- The 30 policies are generated verbatim from the signed PDFs by
  `scripts/extract-legal-content`. Putting them in an editor would let the
  website drift from the documents people have actually signed, which needs a
  decision before it is built.
