import { ApproachBand } from "./components/ApproachBand";
import { CtaBand } from "./components/CtaBand";
import { FeatureBand } from "./components/FeatureBand";
import { ImageBand } from "./components/ImageBand";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Nav } from "./components/Nav";
import { PainPointBand } from "./components/PainPointBand";
import { PartnerLogos } from "./components/PartnerLogos";
import { ProblemCards } from "./components/ProblemCards";
import { SocialProof } from "./components/SocialProof";
import { Testimonials } from "./components/Testimonials";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="flex min-h-screen flex-col" style={{ background: "linear-gradient(to bottom, #f8f1fe 0%, #f0e5fd 60%, #f5ecfe 100%)" }}>
        <Hero />
        <PartnerLogos />
      </div>
      <PainPointBand />
      <FeatureBand />
      <ProblemCards />
      <ImageBand />
      <ApproachBand />
      <HowItWorks />
      <SocialProof />
      <Testimonials />
      <CtaBand />
      <Footer />
    </>
  );
}
