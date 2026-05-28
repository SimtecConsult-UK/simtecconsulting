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
      <div style={{ background: "#E46897" }}>
        <Nav />
      </div>
      <div style={{ background: "linear-gradient(to bottom, #E46897 0%, #eda8c0 60%, #d85e8e 100%)" }}>
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
