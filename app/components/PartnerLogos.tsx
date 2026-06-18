import { TickerFades } from "./TickerFades";

const logoNames = [
  "Northbridge Construction",
  "BuildState",
  "Atlas Civil",
  "DARS",
  "The Great Seal",
  "Ironwood",
  "MetroDOT",
  "Harvest Fields",
  "dss Public Works",
  "Summit DPHHS",
];

function LogoNode({ name }: { name: string }) {
  if (name === "Northbridge Construction") {
    return (
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 40 40" className="h-4 w-4" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 28 L20 12 L29 28 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="text-[6px] font-semibold leading-tight tracking-wide">
          NORTHBRIDGE<br />
          <span className="font-normal opacity-80">CONSTRUCTION</span>
        </div>
      </div>
    );
  }
  if (name === "BuildState") {
    return (
      <div className="text-[12px] font-bold tracking-tight">
        <span className="font-light italic">Build</span>State
      </div>
    );
  }
  if (name === "Atlas Civil") {
    return (
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 40 40" className="h-4 w-4" fill="none">
          <path d="M4 30 L20 8 L36 30 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M4 30 H36" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="text-[6px] font-semibold leading-tight tracking-wider">
          STATE OF ATLAS<br />
          <span className="font-normal opacity-80">CIVIL WORKS</span>
        </div>
      </div>
    );
  }
  if (name === "DARS") {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 60 24" className="h-2.5 w-6">
          <path d="M2 22 Q 30 -4 58 22" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <div className="mt-0.5 text-[10px] font-bold tracking-tight">DARS</div>
        <div className="text-[5px] font-medium tracking-widest opacity-80">DEPT. OF ASSET REGISTRATION</div>
      </div>
    );
  }
  if (name === "The Great Seal") {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 40 40" className="h-4 w-4" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="0.8" />
          <path d="M12 20 L20 14 L28 20 L24 26 H16 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
        </svg>
        <div className="mt-0.5 text-[5px] font-medium tracking-widest opacity-80">THE GREAT SEAL</div>
      </div>
    );
  }
  if (name === "Ironwood") {
    return <div className="text-[12px] font-serif italic tracking-tight">Ironwood</div>;
  }
  if (name === "MetroDOT") {
    return (
      <div className="flex flex-col items-center">
        <div className="text-[9px] font-bold tracking-tight">MetroDOT</div>
        <div className="text-[5px] font-medium tracking-widest opacity-80">INFRASTRUCTURE PROGRAM</div>
      </div>
    );
  }
  if (name === "Harvest Fields") {
    return (
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 40 40" className="h-4 w-4" fill="none">
          <path d="M8 28 Q 20 8 32 28 Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <path d="M14 28 V 20 M20 28 V 16 M26 28 V 20" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <div className="text-[6px] font-semibold leading-tight tracking-wide">
          HARVEST FIELDS<br />
          <span className="font-normal opacity-80">PARTNER PROGRAM</span>
        </div>
      </div>
    );
  }
  if (name === "dss Public Works") {
    return (
      <div className="flex flex-col items-start">
        <div className="text-[12px] font-bold lowercase italic">dss</div>
        <div className="text-[5px] font-medium leading-tight tracking-wide opacity-80">DEPT. OF SITE SERVICES</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 40 24" className="h-3 w-5" fill="none">
        <path d="M2 22 L12 6 L20 14 L28 4 L38 22 Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
      <div className="mt-0.5 text-[8px] font-bold tracking-tight">SUMMIT</div>
      <div className="text-[5px] font-medium tracking-widest opacity-80">DPHHS</div>
    </div>
  );
}

export function PartnerLogos() {
  return (
    <section className="sticky bottom-0 z-10" style={{ background: "#0b0a0c" }}>
      {/* Desktop: static grid */}
      <div className="hidden lg:block w-full px-8 py-3 md:px-16">
        <div className="mx-auto max-w-[var(--container-content)] grid grid-cols-10 items-center gap-4">
          {logoNames.map((name) => (
            <div key={name} className="flex h-8 items-center justify-center text-white/80" aria-label={name}>
              <LogoNode name={name} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/tablet: continuous marquee */}
      <div className="lg:hidden relative py-3" style={{ overflow: "hidden" }}>
        <TickerFades color="#0b0a0c" />
        <div className="logo-ticker-track flex items-center" style={{ width: "max-content" }}>
          {[...logoNames, ...logoNames].map((name, i) => (
            <div
              key={i}
              className="flex h-8 w-32 flex-shrink-0 items-center justify-center px-3 text-white/80"
              aria-label={i < logoNames.length ? name : undefined}
              aria-hidden={i >= logoNames.length}
            >
              <LogoNode name={name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
