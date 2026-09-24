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

## Moving the existing content in

The site ships with content committed in the repository — sample blog posts in
`app/lib/blog/content.ts` and the two real case studies in
`app/lib/caseStudies.ts`. Until a row exists in the database:

- the **blog** serves the committed samples;
- the **homepage** serves the committed case studies.

So nothing breaks before the tables are filled, and the case studies keep
working if a read ever fails. Once you add real content through `/admin`, the
database wins. The committed copies stay as the fallback and can be deleted
later, once every case study has been re-entered.

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
