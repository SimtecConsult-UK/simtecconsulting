import { CtaBand } from "./components/CtaBand";
import { ModulePicker } from "./components/ModulePicker";
import { OnSiteOperations } from "./components/OnSiteOperations";
import { Footer } from "./components/Footer";
import { BlueprintBackground } from "./components/BlueprintBackground";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Team } from "./components/Team";
import { PartnerLogos } from "./components/PartnerLogos";
import { SocialProof } from "./components/SocialProof";
import { Testimonials } from "./components/Testimonials";

export default function Home() {
  return (
    <>
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

      <Team />

      <ModulePicker />

      <OnSiteOperations />

      <SocialProof />
      <Testimonials />
      <CtaBand />
      <Footer />
    </>
  );
}
