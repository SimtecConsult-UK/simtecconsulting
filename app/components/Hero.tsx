import { BlueprintBackground } from "./BlueprintBackground";

export function Hero() {
  return (
    <section
      className="relative overflow-visible lg:h-[140vh]"
    >
      <BlueprintBackground />

      {/* Text content — nav spacer + content centred between nav bottom and mockup top */}
      <div
        className="relative z-10 flex flex-col pb-14 lg:pb-0 lg:h-[calc(100vh-60px)]"
      >
        {/* Pushes content below the fixed nav */}
        <div className="h-24 flex-shrink-0 lg:h-[var(--nav-height)]" />
        {/* Aligned to nav logo — same container as Nav */}
        <div className="mx-auto w-full max-w-[var(--container-content)] flex flex-1 flex-col items-center justify-center text-center px-2.5 md:px-10">
        <h1
          className="max-w-[728px] text-[32px] font-bold leading-[1.2] md:text-[44px] lg:text-[54px]"
          style={{
            fontFamily: "var(--font-league-spartan)",
            backgroundImage:
              "linear-gradient(180deg, #d4faf5 0%, #6eeada 55%, #3ec4b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Construction software that works the way you do.
        </h1>

        <p className="mt-3 max-w-[580px] text-[16px] leading-relaxed text-white/80 md:mt-4">
          We partner with construction, environmental and infrastructure businesses to understand how you work, then engineer bespoke systems that fit your operation perfectly.
        </p>

        <div className="mt-5 md:mt-6">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-[12px] font-semibold text-on-surface shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02]"
          >
            Book a Workshop
          </a>
        </div>
        </div>{/* end inner flex */}
      </div>{/* end text container */}

      {/* macOS browser window — starts at 58vh, overflows below viewport */}
      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 hidden lg:block"
        style={{ top: "calc(100vh - 60px)", width: "min(960px, calc(100vw - 48px))" }}
      >
        {/* Ambient glow behind the window */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-24 -top-10 h-48 blur-[90px]"
          style={{ background: "rgba(110,70,240,0.28)" }}
        />

        {/* Window chrome + video */}
        <div
          className="relative overflow-hidden rounded-[10px] border border-black/[0.12] flex flex-col"
          style={{
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.65), " +
              "0 0 0 1px rgba(0,0,0,0.06)",
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
            <div
              className="flex items-center gap-1.5 rounded-md px-3 bg-[#d8d8d8] h-[17px] w-[320px] mx-auto flex-shrink-0"
            >
              {/* Lock icon */}
              <svg
                width="9"
                height="10"
                viewBox="0 0 9 10"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <rect
                  x="0.5"
                  y="4.5"
                  width="8"
                  height="5"
                  rx="1.5"
                  stroke="rgba(0,0,0,0.38)"
                  strokeWidth="1"
                />
                <path
                  d="M2.5 4.5V3a2 2 0 014 0v1.5"
                  stroke="rgba(0,0,0,0.38)"
                  strokeWidth="1"
                />
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

          {/* Video — scale up slightly to crop any dark border baked into the recording */}
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
    </section>
  );
}
