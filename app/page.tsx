import type { Metadata } from "next";
import { CtaBand } from "./components/CtaBand";
import { ModulePicker } from "./components/ModulePicker";
import { CaseStudies } from "./components/CaseStudies";
import { getCaseStudies } from "./lib/caseStudiesData";
import { getHero, getTeamPhotos } from "./lib/homepage/data";
import { Footer } from "./components/Footer";
import { BlueprintBackground } from "./components/BlueprintBackground";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Team } from "./components/Team";
import { PartnerLogos } from "./components/PartnerLogos";
import { SocialProof } from "./components/SocialProof";
import { SeoJsonLd } from "./components/SeoJsonLd";
import { Testimonials } from "./components/Testimonials";
import { ROUTES } from "./lib/sections";
import { pageMetadata } from "./lib/seo/metadata";

/** The title, description and share picture come from /admin/seo. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(ROUTES.home);
}

export default async function Home() {
  // Hero and Team read their own content, but React cannot call them until this
  // function returns, so awaiting the case studies alone would make their two
  // queries wait a whole round trip. Started together here; both reads are
  // `cache()`d, so the components then await a promise that is already settled.
  const [caseStudies] = await Promise.all([getCaseStudies(), getHero(), getTeamPhotos()]);

  return (
    <>
      <SeoJsonLd path={ROUTES.home} />
      <Nav />
      {/* Hero zone — blueprint hero + product mockup, then partner logos on the same dark band.
          The blueprint background lives at the zone level so it's a single continuous
          backdrop behind the hero AND the logo band (the band is transparent and sits on it). */}
      <div className="hero-zone">
        <BlueprintBackground />
        <Hero />
        <PartnerLogos />
        <div style={{ height: "var(--hero-gap)" }} />
      </div>

      <ModulePicker />

      <Team />

      <CaseStudies studies={caseStudies} />

      <SocialProof />
      <Testimonials />
      <CtaBand />
      <Footer />
    </>
  );
}
