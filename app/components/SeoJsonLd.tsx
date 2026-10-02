import { ROUTES, absoluteUrl } from "../lib/sections";
import { faqNode, organisationNode } from "../lib/seo/jsonLd";
import { resolvePage } from "../lib/seo/metadata";
import { JsonLd } from "./JsonLd";

/**
 * The structured data for a page outside the newsletter.
 *
 * This is the half of the CMS's "SEO & AI" section that no reader ever sees:
 * the key takeaway and the FAQ pairs are written here, in the machine-readable
 * form that search engines use for rich results and that AI assistants quote
 * when they answer a question about Simtec.
 *
 * Blog posts emit their own, shaped as an Article, from `app/blog/[slug]` —
 * built from the same `organisationNode` and `faqNode` as these.
 */
export async function SeoJsonLd({ path }: { path: string }) {
  const { page, settings, title, description, shareImage } = await resolvePage(path);
  // JSON-LD is emitted verbatim rather than resolved by Next, so every address
  // in it has to be absolute.
  const url = absoluteUrl(path);
  const organisation = organisationNode(settings);

  return (
    <JsonLd
      blocks={[
        {
          "@context": "https://schema.org",
          "@type": page.schemaType,
          name: title,
          // The key takeaway is the plainly-stated answer an assistant is meant
          // to lift; the meta description is the sales line. Prefer the answer.
          description: page.keyTakeaway ?? description,
          url,
          ...(shareImage ? { image: shareImage.url } : {}),
          ...(page.schemaType === "Service"
            ? { provider: organisation }
            : { publisher: organisation }),
        },
        faqNode(page.faqs),
        // Who Simtec is, said once, on the page an assistant is most likely to read.
        path === ROUTES.home ? { "@context": "https://schema.org", ...organisation } : null,
      ]}
    />
  );
}
