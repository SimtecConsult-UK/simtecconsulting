# Supabase — the content manager's database

The content manager at `/admin` reads and writes four collections here:
newsletter posts (the blog), homepage case studies, the submissions the
discovery wizard sends, and what the website tells search engines and AI
assistants about itself. The editable ones are the posts, the case studies and
the search settings; submissions are only read and deleted, since they are a
record of what somebody sent.

## What is here

| File | What it creates |
|---|---|
| `migrations/0001_newsletter_posts.sql` | The `posts` table, its access rules and the `blog-images` bucket |
| `migrations/0002_case_studies.sql` | The `case_studies` table, its access rules and the `case-study-media` bucket |
| `migrations/0003_seed_case_studies.sql` | The two real case studies, so the table starts with the site's current content |
| `migrations/0004_case_study_vertase.sql` | The third case study, Vertase / VertaVerse |
| `migrations/0005_submissions.sql` | The `submissions` table behind the discovery wizard |
| `migrations/0006_case_study_quote_photo.sql` | The optional photo beside a case-study quote |
| `migrations/0007_case_study_corrections.sql` | Vertase's colour logo, and the names and photos for the three seeded quotes |
| `migrations/0008_site_seo.sql` | The `site_settings` and `page_seo` tables behind **SEO & AI**, and the `site-assets` bucket holding the favicon and share pictures |

The columns are the fields of the editors in the CMS handover, one for one.

## Setting it up

1. **Create the project** at supabase.com. Note its region — pick one close to
   your visitors.

2. **Run the migrations**, in order, in the project's SQL editor
   (Database → SQL Editor → New query). Paste `0001` and run it, then each of
   the rest in number order. Skipping `0003`/`0004` leaves the case studies
   table empty, and an empty table means the homepage renders no case studies
   section at all. Skipping `0005` means the discovery wizard has nowhere to
   send completed enquiries. Skipping `0007` leaves Vertase with the
   placeholder black logo and the three quotes without their photos and
   speakers' names. Skipping `0008` leaves the **SEO & AI** section with
   nothing to save to — the live pages still work, because they fall back to
   the wording written in `app/lib/seo/pages.ts`.

   `0006` and `0007` are safe to run on a database that is already live, and
   safe to run twice. `0007` only changes a value that is still the one
   `0003`/`0004` seeded, so anything edited in the CMS since is left alone.

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

Row-level security is on for every table, and the site only ever connects with
the anon key. That key can:

- read **published** posts, and nothing else from `posts` — a draft is
  invisible even to somebody who guesses its address;
- read case studies;
- read the site's search settings, which are by definition public — they are
  what the pages put in their own `<head>`;
- read files in all three buckets.

Every write, and any sight of a draft, requires a signed-in session. The same
rule is enforced three times over: the proxy redirects signed-out visitors, and
`requireEditor()` runs in the admin layout and again inside every save action,
because a Server Action is a public endpoint. Postgres itself refuses the write
regardless.

Every bucket also caps what it will accept — 10 MB of image for `blog-images`,
15 MB of image or MP4/WebM for `case-study-media`, 5 MB for `site-assets`. The
editor checks a file before uploading it and explains what is wrong in plain
words; these caps are the backstop, so the limits hold even if that check is
bypassed. `site-assets` is the only bucket that accepts SVG, because a favicon
is commonly drawn as one; it is served from the Supabase domain and only ever
referenced by `<link rel="icon">`, never rendered as a document on ours.

## Where the search settings came from

The **SEO & AI** section did not move any content: every page's title and
description are still written in `app/lib/seo/pages.ts`, exactly as they were
in the page files before. The database only holds what somebody has since
changed, so an empty `page_seo` table and an untouched `site_settings` row
leave the live site word for word as it was built.

The same is true of the favicon. `public/favicon.ico` is still the site's icon;
uploading one in the CMS points the pages at the uploaded file instead, and
removing it puts the committed one back.

## Moving the existing content in

The **case studies** were moved into the database by
`migrations/0003_seed_case_studies.sql`, which carries the two real ones over
with their existing `/public` logo and video paths — `publicUrl()` passes any
path starting with `/` straight through, so nothing had to be uploaded first.
Replacing a logo or recording through the editor uploads it to storage
properly. The database is now the only source: an empty table means the
homepage renders no case studies section at all.

### `/public` files the seeded rows point at

These are referenced by migrations rather than by any component, so a sweep for
unused assets will not find a reference and must not delete them:

| File | Referenced by |
|---|---|
| `/logos/compli-digital-color.png` | `0003` |
| `/logos/jackson-geo-services-color.svg` | `0003` |
| `/logos/vertase-fli-black.svg` | `0004` — superseded by `0007`, but still what a fresh database inserts before `0007` runs |
| `/logos/vertase-fli-color.png` | `0007`, and what the live site shows |
| `/people/tina-jackson.jpg`, `/people/daniel-mallet.jpg`, `/people/steve-edgar.jpg` | `0007` |
| `/video1-section1.webm` | `0003`, `0004` — the stand-in recording all three studies share |

Note `/logos/vertase-fli.svg` is a **white** knockout for the dark hero band
and is invisible on the case studies section, which is why `0004` reached for a
black variant and `0007` for the colour one. The Jackson logos have the same
trap: `jackson-geo-services.svg` is white, `-color.svg` is the one to use.

The `/people` photos used in the **testimonials** section are different — they
are listed in `app/components/Testimonials.tsx`, not in the database, because
that section's content is in code.

The **blog** still ships sample posts in `app/lib/blog/content.ts`, but they
only appear while no Supabase project is configured — on a fresh clone, so
`npm run dev` works. Once a project is configured the blog never falls back: a
failed read shows the blog's own empty state, because lorem ipsum on the live
site would be worse than an empty page.

## What is deliberately not here yet

**Policies**, the remaining section in the CMS handover.

The 30 policies are generated verbatim from the signed PDFs by
`scripts/extract-legal-content`. Putting them in an editor would let the
website drift from the documents people have actually signed, which needs a
decision before it is built.

Nothing notifies anybody when a discovery wizard is submitted. It arrives in
`/admin` and waits to be found, so somebody has to look. Sending an email on
each submission needs a mail provider, an API key and a verified sending
domain — a deliberate next step rather than an oversight.
