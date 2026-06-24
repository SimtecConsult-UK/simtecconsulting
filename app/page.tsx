import { CtaBand } from "./components/CtaBand";
import { ModulePicker } from "./components/ModulePicker";
import { OnSiteOperations } from "./components/OnSiteOperations";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { PartnerLogos } from "./components/PartnerLogos";
import { SocialProof } from "./components/SocialProof";
import { Testimonials } from "./components/Testimonials";

export default function Home() {
  return (
    <>
      <Nav />
      {/* Hero zone — blueprint hero + product mockup, then partner logos on the same dark band */}
      <div className="hero-zone" style={{ background: "#0b0a0c" }}>
        <Hero />
        <PartnerLogos />
        <div style={{ height: "var(--hero-gap)" }} />
      </div>

      <ModulePicker />

      <OnSiteOperations />

      <SocialProof />
      <Testimonials />
      <CtaBand />
      <Footer />
    </>
  );
}
