import { CtaBand } from "./components/CtaBand";
import { FeatureBand } from "./components/FeatureBand";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { PainPointBand } from "./components/PainPointBand";
import { PartnerLogos } from "./components/PartnerLogos";
import { ProductMock } from "./components/ProductMock";
import { ProblemCards } from "./components/ProblemCards";
import { SocialProof } from "./components/SocialProof";
import { Testimonials } from "./components/Testimonials";

export default function Home() {
  return (
    <>
      <Nav />
      {/* Hero zone — 100vh hero + scroll space for overflowing mockup + sticky logos */}
      <div style={{ background: "#0b0a0c" }}>
        <Hero />
        {/* Spacer: covers mockup overflow + breathing room before logos land */}
        <div style={{ height: "calc(50vh + 45px)" }} />
        <PartnerLogos />
        <p className="py-3 text-center text-[9px] font-medium tracking-[0.18em] uppercase text-white/80">
          Built with construction, environmental and infrastructure businesses.
        </p>
        <div style={{ height: "45px" }} />
      </div>
      <PainPointBand />

      {/* Shared background zone — blobs flow across FeatureBand, ProblemCards, ProductMock */}
      <div className="relative overflow-hidden bg-[var(--color-surface-container-low)]">
        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute left-[10%] top-[15%] h-[520px] w-[520px] rounded-full opacity-[0.16] blur-[120px]" style={{ background: "#ff5db3" }} />
        <div aria-hidden className="pointer-events-none absolute right-[5%] top-[45%] h-[440px] w-[440px] rounded-full opacity-[0.13] blur-[110px]" style={{ background: "#6eeada" }} />
        <div aria-hidden className="pointer-events-none absolute bottom-[8%] left-[38%] h-[360px] w-[360px] rounded-full opacity-[0.11] blur-[100px]" style={{ background: "#b04df0" }} />

        <FeatureBand />
        <ProblemCards />
        <div className="px-4 pb-24 md:px-16 md:pb-32">
          <div className="mx-auto max-w-[var(--container-content)]">
            <ProductMock />
          </div>
        </div>
      </div>

      <SocialProof />
      <Testimonials />
      <CtaBand />
      <Footer />
    </>
  );
}
