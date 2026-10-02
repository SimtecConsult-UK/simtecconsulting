import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ibmPlexSans } from "../lib/fonts";
import { PoliciesBrowser } from "./PoliciesBrowser";
import { SeoJsonLd } from "../components/SeoJsonLd";
import { ROUTES } from "../lib/sections";
import { pageMetadata } from "../lib/seo/metadata";
import "../components/legal/legal.css";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(ROUTES.policies);
}

export default function PoliciesPage() {
  return (
    <>
      <SeoJsonLd path={ROUTES.policies} />
      <Nav solid />
      <main className={`${ibmPlexSans.variable} lg-root lg-x`}>
        <PoliciesBrowser />
      </main>
      <Footer />
    </>
  );
}
