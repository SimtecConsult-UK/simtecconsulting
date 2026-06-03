import { NeonTriangles } from "./NeonTriangles";

export function Hero() {
  return (
    <section
      className="relative flex-1 overflow-hidden flex flex-col items-center justify-center"
      style={{ paddingTop: "80px" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0) 75%)" }}
      />
      <NeonTriangles />

      <div className="relative mx-auto max-w-[var(--container-content)] w-full px-4 py-10 md:px-16">
        <h1
          className="mx-auto max-w-[840px] text-center text-[36px] font-bold leading-[1.04] tracking-[-0.02em] sm:text-[48px] md:text-[60px] lg:text-[72px]"
          style={{
            fontFamily: "var(--font-league-spartan)",
            backgroundImage: "linear-gradient(180deg, #ffffff 0%, #e3eaff 50%, #c7d4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px rgba(255,255,255,0.35))",
            paddingTop: "0.12em",
            marginTop: "-0.12em",
          }}
        >
          <span className="block whitespace-nowrap">Operational Systems</span>
          <span className="block">Built for Real</span>
          <span className="block">Construction Work.</span>
        </h1>

        <div className="mt-12 flex justify-center md:mt-16">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-[17px] font-semibold text-on-surface shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02]"
          >
            Book a Workshop
          </a>
        </div>
      </div>
    </section>
  );
}
