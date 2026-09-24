# Supabase — newsletter posts

The blog at `/blog` currently reads sample posts from `app/lib/blog/content.ts`.
This folder holds the database side that replaces it.

## What is here

- `migrations/0001_newsletter_posts.sql` — the `posts` table, its access rules
  and the `blog-images` storage bucket. Its columns are the fields of the post
  editor in the CMS handover, and they match the `Post` type the site already
  renders (`app/lib/blog/types.ts`).

## Connecting it

1. Create the Supabase project (needs a Supabase account — not something this
   repo can do for you).
2. Run `migrations/0001_newsletter_posts.sql` in the project's SQL editor.
3. Put the project's URL and **anon** key into the environment:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   NEXT_PUBLIC_SITE_URL=https://<the live domain>
   ```

   Locally that is `.env.local`; on Vercel it is Project → Settings →
   Environment Variables. The anon key is safe in the browser: row-level
   security in the migration limits it to reading published posts.
4. Add the Supabase storage host to `next.config.ts` so `next/image` will serve
   cover images from it.
5. Rewrite `app/lib/blog/posts.ts` against Supabase. Nothing else changes —
   every page and component already goes through that file, and its functions
   are already `async` and wrapped in React's `cache`.

   Push the work into the query rather than doing it in JavaScript, or each
   page will fetch the whole table and throw most of it away:

   - `getPost` — `.eq('slug', slug).maybeSingle()`, not fetch-all-then-`find`.
   - `getRelatedPosts` — `.neq('slug', slug).order('published_at',
     { ascending: false }).limit(3)`.
   - `getIndex` / `getRelatedPosts` — select only the summary columns. A card
     shows a title, date, standfirst and cover; it has no use for `body` or
     `faqs`, which are the two largest columns in the table.
   - Sorting belongs in `order('published_at', { ascending: false })`, which is
     what the migration's partial index exists for.

## What is deliberately not here yet

The editing screens. The CMS handover designs a whole admin app (sign-in,
Submissions, Policies, Newsletter, Case studies); this migration only covers
the newsletter collection the blog reads. Logins, uploads and the editor UI are
the next piece of work.
