-- Three corrections to the seeded case studies, supplied by the client after
-- 0003 and 0004 were written: Vertase's real logo, and the names behind two
-- quotes that were seeded without them.
--
-- Content, not schema. It is here rather than done in the CMS so that a
-- database built from these migrations starts out matching the live site.
--
-- Every statement is guarded on the value the seed wrote, so re-running this
-- file cannot undo an editor's work: once a value has been changed in the CMS,
-- no clause here matches it any more. The photos are attached in the same
-- statement that renames the speaker, with `coalesce` so a photo an editor has
-- since chosen — or deliberately removed — is left as they left it.
--
-- The paths are '/'-prefixed, so they are files in /public rather than storage
-- keys; publicUrl() passes those through untouched. Replacing any of them
-- through the CMS writes a storage key instead.

-- Vertase: the full-colour logo supplied by the client, replacing the flat
-- black mark 0004 stood in for it.
update public.case_studies
   set logo_path   = '/logos/vertase-fli-color.png',
       logo_width  = 300,
       logo_height = 245
 where logo_path = '/logos/vertase-fli-black.svg';

-- Compli: Tina's surname.
update public.case_studies
   set quote_attribution = 'Tina Jackson · Compli Digital',
       quote_photo_path  = coalesce(quote_photo_path, '/people/tina-jackson.jpg')
 where quote_attribution = 'Tina · Compli Digital';

-- Jackson: the quote was attributed to the company because the speaker was
-- unconfirmed. It is Dan Mallet, who also appears in the testimonials section.
update public.case_studies
   set quote_attribution = 'Dan Mallet · Jackson Geo-Services',
       quote_photo_path  = coalesce(quote_photo_path, '/people/daniel-mallet.jpg')
 where quote_attribution = 'Jackson Geo-Services';

-- Vertase's attribution was already named, so this row only gains the photo.
update public.case_studies
   set quote_photo_path = '/people/steve-edgar.jpg'
 where quote_attribution = 'Steve Edgar · MD, Vertase FLI'
   and quote_photo_path is null;
