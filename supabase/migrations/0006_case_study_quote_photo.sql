-- A photo of the person quoted.
--
-- The quote card in the case studies section can now show a small round
-- headshot beside the attribution, the same as the testimonials further down
-- the homepage. The column is optional, like `video_poster_path` and unlike
-- `logo_path`: a case study without a photo renders the attribution on its
-- own, exactly as before, so nothing breaks for a study that has not been
-- given one. That is why the editor does not require it either.
--
-- Uploads land under a 'quote-photos/' prefix in the existing
-- 'case-study-media' bucket. The policies and the size and type caps in 0002
-- are scoped to the bucket rather than to a prefix, so the new prefix inherits
-- public read, editor-only write and the 15 MB cap with nothing to add here.

alter table public.case_studies
  add column if not exists quote_photo_path text;

comment on column public.case_studies.quote_photo_path is
  'Square headshot of the person quoted. Optional.';
