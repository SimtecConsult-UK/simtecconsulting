import { NeonTriangles } from "./NeonTriangles";

export function Hero() {
  return (
    <section
      className="relative"
      style={{ height: "100vh", overflow: "visible" }}
    >
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0) 75%)",
        }}
      />
      <NeonTriangles />

      {/* Text content — nav spacer + content centred between nav bottom and mockup top */}
      <div
        className="relative z-10 flex flex-col items-center px-4 text-center md:px-16"
        style={{ height: "72vh" }}
      >
        {/* Pushes content below the fixed nav */}
        <div style={{ height: "44px", flexShrink: 0 }} />
        {/* Remaining space — content centred so gap above h1 = gap below CTA */}
        <div className="flex flex-1 flex-col items-center justify-center">
        <h1
          className="mx-auto max-w-[728px] text-[54px] font-bold leading-[1.15] tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-league-spartan)",
            backgroundImage:
              "linear-gradient(180deg, #ffffff 0%, #e3eaff 50%, #c7d4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px rgba(255,255,255,0.35))",
          }}
        >
          Construction software that works the way you do.
        </h1>

        <p className="mt-3 max-w-[655px] text-[16px] leading-relaxed text-white/55 md:mt-4">
          For construction teams that need better control, cleaner data and software that fits the way the business actually runs.
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
        className="absolute left-1/2 z-10 -translate-x-1/2"
        style={{ top: "72vh", width: "min(960px, calc(100vw - 48px))" }}
      >
        {/* Ambient glow behind the window */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-24 -top-10 h-48 blur-[90px]"
          style={{ background: "rgba(110,70,240,0.28)" }}
        />

        {/* Window chrome + video */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.65), " +
              "0 0 0 1px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
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
              className="flex items-center gap-1.5 rounded-md px-3"
              style={{
                background: "#d8d8d8",
                height: "17px",
                width: "320px",
                margin: "0 auto",
                flexShrink: 0,
              }}
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
