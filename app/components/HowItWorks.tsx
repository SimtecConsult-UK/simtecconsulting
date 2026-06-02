"use client";

import { useEffect, useRef } from "react";
import React from "react";
import { HowItWorksTriangles } from "./HowItWorksTriangles";

const DOT_COUNT               = 12;
const DOT_INTERVAL_MS         = 60;   // 2× speed
const CONNECTOR_MS            = DOT_COUNT * DOT_INTERVAL_MS; // 720 ms
const CONSTRUCTION_MS         = 1000; // 2× speed
const ICON_FADE_MS            = 400;  // cross-fade construction → icon
const POST_CONSTRUCTION_PAUSE = 400;  // breathing room before connector starts
const UNLOCK_PAUSE_MS         = 350;  // gap after connector before next step
const CYCLE_MS =
  CONSTRUCTION_MS + ICON_FADE_MS + POST_CONSTRUCTION_PAUSE + CONNECTOR_MS + UNLOCK_PAUSE_MS;

const CONNECTOR_H        = 260; // px
const STEP_W             = 576; // 2× previous
const CIRCLE_W           = 240; // 2× previous
const circleCenterOffset = STEP_W / 2; // 144 px from the aligned edge

/* ── tiny construction SVG ────────────────────────────────────────────────── */
function ConstructionSVG() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[168px] w-[168px]"
    >
      {/* Fence — appears first */}
      <g className="c-fence" stroke="#f97316" strokeWidth="1.5">
        <line x1="3"  y1="69" x2="77" y2="69" />
        <line x1="3"  y1="73" x2="77" y2="73" />
        {[6, 17, 28, 39, 50, 61, 72].map((x) => (
          <line key={x} x1={x} y1="65" x2={x} y2="77" />
        ))}
      </g>

      {/* Crane — appears second */}
      <g className="c-crane-group" stroke="#f59e0b" strokeWidth="1.5">
        {/* Vertical tower */}
        <rect x="52" y="24" width="5" height="41" rx="1" fill="#fefce8" />
        {/* Horizontal boom */}
        <line x1="36" y1="20" x2="72" y2="20" />
        {/* Counterweight block */}
        <rect x="36" y="16" width="8" height="6" rx="1" fill="#fefce8" />
        {/* Trolley */}
        <rect x="62" y="18" width="6" height="4" rx="1" fill="#fefce8" />
      </g>

      {/* Cable — drawn on */}
      <line
        className="c-cable"
        x1="65" y1="22" x2="65" y2="44"
        stroke="#f59e0b" strokeWidth="1.3"
      />

      {/* Building — three floors rise from bottom to top */}
      <rect
        className="c-block-1"
        x="4" y="45" width="44" height="20" rx="2"
        fill="#dde5f9" stroke="#8a9fd4" strokeWidth="1.2"
      />
      <rect
        className="c-block-2"
        x="6" y="29" width="40" height="16" rx="2"
        fill="#dde5f9" stroke="#8a9fd4" strokeWidth="1.2"
      />
      <rect
        className="c-block-3"
        x="8" y="16" width="36" height="13" rx="2"
        fill="#dde5f9" stroke="#8a9fd4" strokeWidth="1.2"
      />

      {/* Windows — fade in last */}
      <g className="c-windows" fill="#4568f3" opacity="0.5">
        {/* Floor 1 */}
        <rect x="9"  y="49" width="7" height="10" rx="1" />
        <rect x="21" y="49" width="7" height="10" rx="1" />
        <rect x="33" y="49" width="7" height="10" rx="1" />
        {/* Floor 2 */}
        <rect x="11" y="33" width="6" height="8" rx="1" />
        <rect x="21" y="33" width="6" height="8" rx="1" />
        <rect x="31" y="33" width="6" height="8" rx="1" />
        {/* Floor 3 */}
        <rect x="13" y="19" width="5" height="7" rx="1" />
        <rect x="22" y="19" width="5" height="7" rx="1" />
        <rect x="31" y="19" width="5" height="7" rx="1" />
      </g>
    </svg>
  );
}

/* ── step definitions ─────────────────────────────────────────────────────── */
const steps = [
  {
    number: "01", title: "Discovery & Operational Design",
    description: "We work with stakeholders to understand workflows, inefficiencies and operational pressures.",
    icon: (
      // Clipboard with magnifying glass — investigation / discovery
      <svg viewBox="0 0 40 40" className="h-[108px] w-[108px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="22" height="27" rx="2" />
        <path d="M15 9V7a2 2 0 014 0v2" />
        <rect x="13" y="7" width="14" height="4" rx="1" />
        <path d="M13 18h14M13 23h9" />
        <circle cx="27" cy="32" r="4" />
        <path d="M30 35l3 3" />
      </svg>
    ),
  },
  {
    number: "02", title: "Workflow Structuring",
    description: "Operational processes are mapped, prioritised and standardised for digitisation.",
    icon: (
      // Flowchart: top box branches into two — process mapping
      <svg viewBox="0 0 40 40" className="h-[108px] w-[108px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="13" y="3" width="14" height="9" rx="2" />
        <path d="M20 12v5M20 17l-8 5M20 17l8 5" />
        <rect x="3" y="24" width="13" height="9" rx="2" />
        <rect x="24" y="24" width="13" height="9" rx="2" />
      </svg>
    ),
  },
  {
    number: "03", title: "System Design & Delivery",
    description: "Reusable components and targeted custom development are combined to create a tailored operational system.",
    icon: (
      // Monitor with code brackets — building the system
      <svg viewBox="0 0 40 40" className="h-[108px] w-[108px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="32" height="22" rx="3" />
        <path d="M4 22h32" />
        <path d="M15 34h10M20 28v6" />
        <path d="M16 13l-4 3.5 4 3.5M24 13l4 3.5-4 3.5" />
      </svg>
    ),
  },
  {
    number: "04", title: "Deployment & Adoption",
    description: "Systems are rolled out across teams, projects and operational workflows.",
    icon: (
      // Rocket launching — rollout / go-live
      <svg viewBox="0 0 40 40" className="h-[108px] w-[108px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4s-9 5-9 16h18C29 9 20 4 20 4z" />
        <circle cx="20" cy="15" r="3" />
        <path d="M11 20l-3 8h24l-3-8" />
        <path d="M15 28l-2 7M25 28l2 7" />
      </svg>
    ),
  },
  {
    number: "05", title: "Hosting, Support & Improvement",
    description: "Simtec continues to host, support and evolve systems over time.",
    icon: (
      // Server racks + circular arrows — ongoing hosting & iteration
      <svg viewBox="0 0 40 40" className="h-[108px] w-[108px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="7" width="30" height="8" rx="2" />
        <rect x="5" y="19" width="30" height="8" rx="2" />
        <circle cx="30" cy="11" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="30" cy="23" r="1.5" fill="currentColor" stroke="none" />
        <path d="M11 33a9 9 0 0118 0" />
        <path d="M9 31l2 3 3-2M31 31l-2 3-3-2" />
      </svg>
    ),
  },
];

/* ── component ────────────────────────────────────────────────────────────── */
export function HowItWorks() {
  const containerRef     = useRef<HTMLDivElement>(null);
  const circleRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const constructionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs         = useRef<(HTMLDivElement | null)[]>([]);
  const trackRefs        = useRef<(SVGPathElement | null)[]>([]);
  const pathRefs         = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs          = useRef<(SVGCircleElement | null)[][]>(
    Array.from({ length: steps.length - 1 }, () => [])
  );
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animatingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W      = container.getBoundingClientRect().width;
    const leftX  = circleCenterOffset;
    const rightX = W - circleCenterOffset;

    // Build bezier paths and pre-position dots along each connector
    pathRefs.current.forEach((pathEl, ci) => {
      if (!pathEl) return;
      const x0 = ci % 2 === 0 ? leftX  : rightX;
      const x1 = ci % 2 === 0 ? rightX : leftX;
      const h  = CONNECTOR_H;
      const d  = `M ${x0} 0 C ${x0} ${h * 0.55} ${x1} ${h * 0.45} ${x1} ${h}`;
      pathEl.setAttribute("d", d);
      trackRefs.current[ci]?.setAttribute("d", d);
      const total = pathEl.getTotalLength();
      dotRefs.current[ci].forEach((dotEl, di) => {
        if (!dotEl) return;
        const t  = (di + 1) / (DOT_COUNT + 1);
        const pt = pathEl.getPointAtLength(t * total);
        dotEl.setAttribute("cx", String(pt.x));
        dotEl.setAttribute("cy", String(pt.y));
      });
    });

    /* ── reset everything ───────────────────────────────────────────────── */
    const reset = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      animatingRef.current = false;

      circleRefs.current.forEach((el) => {
        if (!el) return;
        el.style.borderColor = "var(--color-outline-variant)";
        el.style.color       = "var(--color-outline-variant)";
        el.classList.remove("circle-pop");
      });
      labelRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = "0";
        el.classList.remove("label-reveal");
      });
      constructionRefs.current.forEach((el) => {
        if (!el) return;
        el.classList.remove("is-constructing");
        el.style.transition = "";
        el.style.opacity    = "0";
      });
      iconRefs.current.forEach((el) => {
        if (!el) return;
        el.style.transition = "";
        el.style.opacity    = "0";
      });
      dotRefs.current.forEach((connector) =>
        connector.forEach((dotEl) => {
          if (!dotEl) return;
          dotEl.setAttribute("fill", "var(--color-outline-variant)");
          dotEl.style.opacity = "0";
          dotEl.style.filter  = "";
        })
      );
    };

    /* ── unlock one step (construction → icon → label) ──────────────────── */
    const unlockStep = (i: number) => {
      const circle       = circleRefs.current[i];
      const construction = constructionRefs.current[i];
      const icon         = iconRefs.current[i];
      const label        = labelRefs.current[i];

      // Show the construction wrapper and (re)start the CSS animation
      if (construction) {
        construction.style.transition = "";
        construction.style.opacity    = "1";
        construction.classList.remove("is-constructing");
        void construction.offsetHeight; // force reflow so animation restarts cleanly
        construction.classList.add("is-constructing");
      }

      // After construction completes: cross-fade to icon, pop circle, reveal label
      timersRef.current.push(
        setTimeout(() => {
          if (construction) {
            construction.style.transition = `opacity ${ICON_FADE_MS}ms ease`;
            construction.style.opacity    = "0";
          }
          if (icon) {
            icon.style.transition = `opacity ${ICON_FADE_MS}ms ease`;
            icon.style.opacity    = "1";
          }
          if (circle) {
            circle.style.borderColor = "var(--color-brand-blue)";
            circle.style.color       = "var(--color-brand-blue)";
            circle.classList.remove("circle-pop");
            void circle.offsetHeight;
            circle.classList.add("circle-pop");
          }
          // Reveal label text once icon is visible
          timersRef.current.push(
            setTimeout(() => {
              if (label) {
                label.style.opacity = "";
                label.classList.remove("label-reveal");
                void label.offsetHeight;
                label.classList.add("label-reveal");
              }
            }, ICON_FADE_MS)
          );
        }, CONSTRUCTION_MS)
      );
    };

    /* ── light up one connector dot ─────────────────────────────────────── */
    const lightDot = (ci: number, di: number) => {
      const el = dotRefs.current[ci]?.[di];
      if (!el) return;
      el.setAttribute("fill", "var(--color-brand-blue)");
      el.style.opacity = "1";
      el.style.filter  = "drop-shadow(0 0 5px rgba(74,108,247,0.65))";
    };

    /* ── main animation sequence ─────────────────────────────────────────── */
    const animate = () => {
      if (animatingRef.current) return;
      animatingRef.current = true;

      unlockStep(0); // step 0 construction starts immediately

      for (let i = 0; i < steps.length - 1; i++) {
        // Connector dots start after: construction + icon fade + breathing room
        const connectorStart =
          i * CYCLE_MS + CONSTRUCTION_MS + ICON_FADE_MS + POST_CONSTRUCTION_PAUSE;

        for (let d = 0; d < DOT_COUNT; d++) {
          timersRef.current.push(
            setTimeout(() => lightDot(i, d), connectorStart + d * DOT_INTERVAL_MS)
          );
        }

        // Next step construction starts at the top of the next cycle
        timersRef.current.push(
          setTimeout(() => unlockStep(i + 1), (i + 1) * CYCLE_MS)
        );
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
        } else if (entry.boundingClientRect.top > 0) {
          // Section is below the viewport — user scrolled back up past it
          reset();
        }
      },
      { threshold: 0 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[var(--color-surface-container-low)] px-4 pb-32 pt-24 md:px-16">
      <HowItWorksTriangles />
      <h2
        className="relative z-10 mx-auto mb-16 max-w-xl text-center text-[22px] font-bold leading-snug tracking-[-0.01em] text-[var(--color-on-surface)] md:text-[28px]"
        style={{ fontFamily: "var(--font-league-spartan)" }}
      >
        From Operational Challenge to Working System
      </h2>
      <div ref={containerRef} className="relative z-10 mx-auto max-w-5xl">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>

            {/* Step node — alternates left / right */}
            <div className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div style={{ width: STEP_W }} className="flex flex-col items-center text-center">

                {/* Circle */}
                <div
                  ref={(el) => { circleRefs.current[idx] = el; }}
                  className="relative flex items-center justify-center rounded-full border-[3px]"
                  style={{
                    width: CIRCLE_W, height: CIRCLE_W,
                    borderColor: "var(--color-outline-variant)",
                    color:       "var(--color-outline-variant)",
                    transition:  "border-color 0.3s ease, color 0.3s ease",
                  }}
                >
                  {/* Construction animation layer */}
                  <div
                    ref={(el) => { constructionRefs.current[idx] = el; }}
                    className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
                    style={{ opacity: 0 }}
                  >
                    <ConstructionSVG />
                  </div>

                  {/* Step icon layer — revealed after construction completes */}
                  <div
                    ref={(el) => { iconRefs.current[idx] = el; }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 0 }}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Label */}
                <div
                  ref={(el) => { labelRefs.current[idx] = el; }}
                  className="mt-12"
                  style={{ opacity: 0 }}
                >
                  <div className="text-[30px] font-bold tracking-[0.14em] text-[var(--color-brand-blue)]">
                    STEP {step.number}
                  </div>
                  <h3
                    className="mt-2 text-[54px] font-bold leading-tight text-on-surface"
                    style={{ fontFamily: "var(--font-league-spartan)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[36px] leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </div>

              </div>
            </div>

            {/* Curved SVG connector — raw pixel coordinates, no viewBox */}
            {idx < steps.length - 1 && (
              <svg width="100%" height={CONNECTOR_H} style={{ display: "block", overflow: "visible" }}>
                {/* Visible dashed track */}
                <path
                  ref={(el) => { trackRefs.current[idx] = el; }}
                  d="M 0 0"
                  stroke="var(--color-outline-variant)"
                  strokeWidth="2"
                  strokeDasharray="5 9"
                  fill="none"
                  opacity="0.35"
                />
                {/* Invisible path for getPointAtLength */}
                <path
                  ref={(el) => { pathRefs.current[idx] = el; }}
                  d="M 0 0"
                  fill="none"
                  stroke="none"
                />
                {/* Animated dots */}
                {Array.from({ length: DOT_COUNT }).map((_, d) => (
                  <circle
                    key={d}
                    ref={(el) => { dotRefs.current[idx][d] = el; }}
                    cx="0" cy="0" r="7"
                    fill="var(--color-outline-variant)"
                    opacity="0"
                    style={{ transition: "opacity 0.2s, fill 0.2s" }}
                  />
                ))}
              </svg>
            )}

          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
