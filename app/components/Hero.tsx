import { NeonTriangles } from "./NeonTriangles";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <NeonTriangles />

      <div className="relative mx-auto max-w-[var(--container-content)] px-4 pb-28 pt-20 sm:pt-28 md:px-16 md:pb-40 md:pt-36">
        <h1 className="mx-auto max-w-[840px] text-center text-[36px] font-bold leading-[1.04] tracking-[-0.02em] text-white sm:text-[48px] md:text-[60px] lg:text-[72px]" style={{ fontFamily: "var(--font-league-spartan)" }}>
          Operational Systems for Construction Companies
        </h1>

        <div className="mt-12 flex justify-center md:mt-16">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-[17px] font-semibold text-on-surface shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02]"
          >
            Schedule a Demo
          </a>
        </div>
      </div>
    </section>
  );
}
