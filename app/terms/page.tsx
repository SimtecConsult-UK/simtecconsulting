import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { GENERAL_TERMS } from "../lib/legal/terms-content";
import { TermsDocument } from "../components/legal/TermsDocument";
import { SeoJsonLd } from "../components/SeoJsonLd";
import { ROUTES } from "../lib/sections";
import { pageMetadata } from "../lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(ROUTES.terms);
}

export default function TermsPage() {
  return (
    <>
      <SeoJsonLd path={ROUTES.terms} />
      <Nav solid />
      <TermsDocument doc={GENERAL_TERMS} />
      <Footer />
    </>
  );
}
