import { SECTION_IDS } from "../lib/sections";

export function Hero() {
  return (
    <section className="hero-root">
      {/* Blueprint background now lives at the hero-zone level (see page.tsx) so it
          spans the hero and the partner-logo band as one continuous backdrop. */}
      {/* Headline + sub, anchored in the dark upper band, clear of the cranes.
          Our global Nav (in page.tsx) sits above; --nav-height reserves its space. */}
      <div className="hero-content">
        <div className="hero-block relative mx-auto w-full max-w-[1200px]">
          <h1 className="hero-h1">
            {/* .hero-root already sets white text; only the accent span needs a color */}
            <span>Construction software built to work </span>
            <span style={{ color: "var(--color-brand-blue)" }}>the way you do.</span>
          </h1>
          <p className="hero-sub">
            We partner with construction, environmental and infrastructure businesses to understand how you work, then engineer bespoke systems that fit your operation perfectly.
          </p>
          {/* Absolutely placed below the text block so it doesn't grow the
              vertically-centered header+sub (preserves the nav→header /
              sub→crane proportions). Centered on tablet/mobile, left-aligned
              on laptop+ to match the text. */}
          <a
            href={`#${SECTION_IDS.contact}`}
            className="absolute left-1/2 top-full mt-7 inline-flex -translate-x-1/2 items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-6 py-2.5 text-[13px] font-semibold text-[#0c2421] transition-colors hover:bg-[#85f0e4] md:text-[14px] min-[1000px]:left-0 min-[1000px]:mt-8 min-[1000px]:translate-x-0"
          >
            Book a Workshop
          </a>
        </div>
      </div>

      {/* macOS product mockup — revealed in the second screen.
          Hidden on phone and tablet (<1000px); shown on laptop/desktop. */}
      <div
        className="absolute left-0 right-0 z-10 hidden px-10 min-[1000px]:block lg:px-16"
        style={{ bottom: "var(--hero-gap)" }}
      >
       {/* Anchored --hero-gap above the hero's bottom edge, which is exactly
           where the partner-logos band begins — so the mockup→logo gap equals
           the nav→header and logo→section-end gaps. The hero's height leaves
           ~15% of the window peeking above the first fold; the rest uncovers
           on scroll. The 1200-wide container + this padding mirror ModulePicker,
           and the window left-aligns within it (no auto margins). */}
       <div className="mx-auto w-full max-w-[1200px]">
        <div className="relative w-full max-w-[960px]">
        {/* Ambient glow behind the window */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-24 -top-10 h-48 blur-[90px]"
          style={{ background: "rgba(110,70,240,0.28)" }}
        />

        {/* Window chrome + video */}
        <div
          className="relative flex flex-col overflow-hidden rounded-[10px] border border-black/[0.12]"
          style={{
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4"
            style={{ background: "#ececec", height: "27px", flexShrink: 0 }}
          >
            {/* Traffic lights */}
            {(["#ff5f57", "#febc2e", "#28c840"] as const).map((color, i) => (
              <span
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            ))}

            {/* URL bar */}
            <div className="mx-auto flex h-[17px] w-[320px] flex-shrink-0 items-center gap-1.5 rounded-md bg-[#d8d8d8] px-3">
              {/* Lock icon */}
              <svg width="9" height="10" viewBox="0 0 9 10" fill="none" style={{ flexShrink: 0 }}>
                <rect x="0.5" y="4.5" width="8" height="5" rx="1.5" stroke="rgba(0,0,0,0.38)" strokeWidth="1" />
                <path d="M2.5 4.5V3a2 2 0 014 0v1.5" stroke="rgba(0,0,0,0.38)" strokeWidth="1" />
              </svg>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(0,0,0,0.5)",
                  letterSpacing: "0.01em",
                  userSelect: "none",
                }}
              >
                app.simtec.io/dashboard
              </span>
            </div>
          </div>

          {/* Video — scaled up slightly to crop any dark border baked into the recording */}
          <div style={{ background: "#ffffff", overflow: "hidden", flexShrink: 0 }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", display: "block", transform: "scale(1.04) translate(3px, 4px)", transformOrigin: "center center" }}
            >
              <source src="/simtechero.webm" type="video/webm" />
              <source src="/simtechero.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        </div>
       </div>
      </div>
    </section>
  );
}
