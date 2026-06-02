import { SolutionTabs } from "./SolutionTabs";


export function FeatureBand() {
  return (
    <section
      id="solutions"
      className="relative px-4 py-24 md:px-16 md:py-32"
    >
      <div className="relative mx-auto max-w-[var(--container-content)]">

        {/* Heading */}
        <h2
          className="text-center text-[36px] font-bold leading-[1.1] sm:text-[48px] md:text-[60px] lg:text-[72px]"
          style={{ fontFamily: "var(--font-league-spartan)" }}
        >
          <span
            className="block whitespace-nowrap bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ff5db3 0%, #b04df0 50%, #4a6cf7 100%)" }}
          >
            Operational Systems
          </span>
          <span className="block text-on-surface">Built for Real</span>
          <span className="block text-on-surface">Construction Workflows</span>
        </h2>

        {/* Solution tabs */}
        <div className="mt-16 md:mt-20">
          <SolutionTabs />
        </div>

      </div>
    </section>
  );
}
