import { CtaBand } from "./components/CtaBand";
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
      {/* Hero zone — 140vh hero + small spacer covering mockup overflow + sticky logos */}
      <div style={{ background: "#0b0a0c" }}>
        <Hero />
        {/* Spacer: covers remaining mockup overflow below the 140vh section (desktop only) */}
        <div className="hidden lg:block" style={{ height: "calc(25vh + 45px)" }} />
        <PartnerLogos />
        <p className="py-3 text-center text-[9px] font-medium tracking-[0.18em] uppercase text-white/80">
          Built with construction, environmental and infrastructure businesses.
        </p>
        <div style={{ height: "45px" }} />
      </div>

      <OnSiteOperations />

      <SocialProof />
      <Testimonials />
      <CtaBand />
      <Footer />
    </>
  );
}
