import { SITE_URL } from "../sections";
import type { FaqPair } from "../blog/types";
import type { SiteSettings } from "./types";

/**
 * The structured-data blocks, built in one place.
 *
 * Both halves of the site emit JSON-LD — the pages through `SeoJsonLd`, each
 * blog post through its own Article — and both have to say the same things
 * about the company and shape a FAQ the same way. Before these, a post named
 * its publisher from a string in the code, so renaming the company in the CMS
 * changed every page except the newsletter.
 */

/** Who Simtec is, as search engines and AI assistants read it. */
export function organisationNode(settings: SiteSettings) {
  return {
    "@type": "Organization",
    name: settings.siteName,
    url: SITE_URL,
    ...(settings.orgLegalName ? { legalName: settings.orgLegalName } : {}),
    ...(settings.orgDescription ? { description: settings.orgDescription } : {}),
    ...(settings.orgSameAs.length > 0 ? { sameAs: settings.orgSameAs } : {}),
  };
}

/** The question-and-answer block, or null when there are no pairs to publish. */
export function faqNode(faqs: FaqPair[]) {
  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((pair) => ({
      "@type": "Question",
      name: pair.q,
      acceptedAnswer: { "@type": "Answer", text: pair.a },
    })),
  };
}
