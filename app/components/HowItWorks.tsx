"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";

const DOT_COUNT               = 12;
const DOT_INTERVAL_MS         = 60;
const CONNECTOR_MS            = DOT_COUNT * DOT_INTERVAL_MS;
const CONSTRUCTION_MS         = 1000;
const ICON_FADE_MS            = 400;
const POST_CONSTRUCTION_PAUSE = 400;
const UNLOCK_PAUSE_MS         = 350;
const CYCLE_MS =
  CONSTRUCTION_MS + ICON_FADE_MS + POST_CONSTRUCTION_PAUSE + CONNECTOR_MS + UNLOCK_PAUSE_MS;

const CONNECTOR_H        = 260;
const STEP_W             = 576;
const CIRCLE_W           = 240;
const circleCenterOffset = STEP_W / 2;

function ConstructionSVG() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[168px] w-[168px]"
    >
      <g className="c-fence" stroke="#f97316" strokeWidth="1.5">
        <line x1="3"  y1="69" x2="77" y2="69" />
        <line x1="3"  y1="73" x2="77" y2="73" />
        {[6, 17, 28, 39, 50, 61, 72].map((x) => (
          <line key={x} x1={x} y1="65" x2={x} y2="77" />
        ))}
      </g>
      <g className="c-crane-group" stroke="#f59e0b" strokeWidth="1.5">
        <rect x="52" y="24" width="5" height="41" rx="1" fill="#fefce8" />
        <line x1="36" y1="20" x2="72" y2="20" />
        <rect x="36" y="16" width="8" height="6" rx="1" fill="#fefce8" />
        <rect x="62" y="18" width="6" height="4" rx="1" fill="#fefce8" />
      </g>
      <line className="c-cable" x1="65" y1="22" x2="65" y2="44" stroke="#f59e0b" strokeWidth="1.3" />
      <rect className="c-block-1" x="4" y="45" width="44" height="20" rx="2" fill="#dde5f9" stroke="#8a9fd4" strokeWidth="1.2" />
      <rect className="c-block-2" x="6" y="29" width="40" height="16" rx="2" fill="#dde5f9" stroke="#8a9fd4" strokeWidth="1.2" />
      <rect className="c-block-3" x="8" y="16" width="36" height="13" rx="2" fill="#dde5f9" stroke="#8a9fd4" strokeWidth="1.2" />
      <g className="c-windows" fill="#4568f3" opacity="0.5">
        <rect x="9"  y="49" width="7" height="10" rx="1" />
        <rect x="21" y="49" width="7" height="10" rx="1" />
        <rect x="33" y="49" width="7" height="10" rx="1" />
        <rect x="11" y="33" width="6" height="8" rx="1" />
        <rect x="21" y="33" width="6" height="8" rx="1" />
        <rect x="31" y="33" width="6" height="8" rx="1" />
        <rect x="13" y="19" width="5" height="7" rx="1" />
        <rect x="22" y="19" width="5" height="7" rx="1" />
        <rect x="31" y="19" width="5" height="7" rx="1" />
      </g>
    </svg>
  );
}

const steps = [
  {
    number: "01", title: "Discovery & Operational Design",
    description: "We work with stakeholders to understand workflows, inefficiencies and operational pressures.",
    icon: (
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

// Triangle stack config per step index 0-3 (step 5 has no triangles)
const STACK_COUNTS  = [3, 2, 1, 2];
const STACK_COLORS  = [
  ["#ffffff", "#ffffff", "#ffffff"],
  ["#ffffff", "#ffffff"],
  ["#ffffff", "#ffffff", "#ffffff"],
  ["#ffffff", "#ffffff"],
] as const;
const STACK_ANIM    = ["9s", "12s", "7s", "10s"] as const;
const STACK_TX      = [
  "0,0; 6,-16; -4,9; 0,0",
  "0,0; -5,13; 4,-10; 0,0",
  "0,0; 5,-14; -3,8; 0,0",
  "0,0; -6,12; 4,-9; 0,0",
] as const;

interface TriDef {
  cx: number; tipY: number; size: number;
  color: string; opacity: number; dur: string;
  tx: string; id: string;
}

export function HowItWorks() {
  const sectionRef       = useRef<HTMLElement>(null);
  const containerRef     = useRef<HTMLDivElement>(null);
  const circleRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const h3Refs           = useRef<(HTMLHeadingElement | null)[]>([]);
  const constructionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs         = useRef<(HTMLDivElement | null)[]>([]);
  const trackRefs        = useRef<(SVGPathElement | null)[]>([]);
  const pathRefs         = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs          = useRef<(SVGCircleElement | null)[][]>(
    Array.from({ length: steps.length - 1 }, () => [])
  );
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animatingRef = useRef(false);

  const [triDefs, setTriDefs] = useState<TriDef[]>([]);

  // ── Measure triangle positions relative to section ──────────────────────
  useEffect(() => {
    const measure = () => {
      const section   = sectionRef.current;
      const container = containerRef.current;
      if (!section || !container) return;

      const sRect     = section.getBoundingClientRect();
      const cRect     = container.getBoundingClientRect();
      const cLeft     = cRect.left - sRect.left;
      const cW        = container.offsetWidth;

      const GAP       = 120;
      const TRI_GAP   = 25;
      const BASE_SIZE = 480;
      const SIZE_STEP = 50;

      const defs: TriDef[] = [];

      for (let si = 0; si < 4; si++) {
        const h3 = h3Refs.current[si];
        if (!h3) continue;

        const h3Rect  = h3.getBoundingClientRect();
        const tipY    = h3Rect.top - sRect.top;
        const isLeft  = si % 2 === 0;
        const count   = STACK_COUNTS[si];
        const colors  = STACK_COLORS[si];

        for (let ti = 0; ti < count; ti++) {
          const size = BASE_SIZE - ti * SIZE_STEP;
          const triY = tipY + ti * TRI_GAP;

          const cx = isLeft
            ? cLeft + STEP_W + GAP + size / 2
            : cLeft + (cW - STEP_W) - GAP - size / 2;

          defs.push({
            cx, tipY: triY, size,
            color:   colors[Math.min(ti, colors.length - 1)],
            opacity: 0.85 - ti * 0.1,
            dur:     STACK_ANIM[si],
            tx:      STACK_TX[si],
            id:      `hiw-t-${si}-${ti}`,
          });
        }
      }

      setTriDefs(defs);
    };

    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    document.fonts.ready.then(measure);
    return () => { ro.disconnect(); };
  }, []);

  // ── Step animation ───────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W      = container.getBoundingClientRect().width;
    const leftX  = circleCenterOffset;
    const rightX = W - circleCenterOffset;

    pathRefs.current.forEach((pathEl, ci) => {
      if (!pathEl) return;
      const x0 = ci % 2 === 0 ? leftX  : rightX;
      // ci=3 connects step 4 (right-aligned) → step 5 (centered)
      const x1 = ci === 3 ? W / 2 : ci % 2 === 0 ? rightX : leftX;
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

    const reset = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      animatingRef.current = false;
      circleRefs.current.forEach((el) => {
        if (!el) return;
        el.style.borderColor = "rgba(255,255,255,0.3)";
        el.style.color       = "rgba(255,255,255,0.3)";
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
          dotEl.setAttribute("fill", "rgba(255,255,255,0.2)");
          dotEl.style.opacity = "0";
          dotEl.style.filter  = "";
        })
      );
    };

    const unlockStep = (i: number) => {
      const circle       = circleRefs.current[i];
      const construction = constructionRefs.current[i];
      const icon         = iconRefs.current[i];
      const label        = labelRefs.current[i];

      if (construction) {
        construction.style.transition = "";
        construction.style.opacity    = "1";
        construction.classList.remove("is-constructing");
        void construction.offsetHeight;
        construction.classList.add("is-constructing");
      }

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
            circle.style.borderColor = "#ffffff";
            circle.style.color       = "#ffffff";
            circle.classList.remove("circle-pop");
            void circle.offsetHeight;
            circle.classList.add("circle-pop");
          }
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

    const lightDot = (ci: number, di: number) => {
      const el = dotRefs.current[ci]?.[di];
      if (!el) return;
      el.setAttribute("fill", "#ffffff");
      el.style.opacity = "1";
      el.style.filter  = "drop-shadow(0 0 5px rgba(255,255,255,0.65))";
    };

    const animate = () => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      unlockStep(0);
      for (let i = 0; i < steps.length - 1; i++) {
        const connectorStart =
          i * CYCLE_MS + CONSTRUCTION_MS + ICON_FADE_MS + POST_CONSTRUCTION_PAUSE;
        for (let d = 0; d < DOT_COUNT; d++) {
          timersRef.current.push(
            setTimeout(() => lightDot(i, d), connectorStart + d * DOT_INTERVAL_MS)
          );
        }
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
    <section
      ref={sectionRef as React.Ref<HTMLElement>}
      // pt-[340px]: 240px (bottom half of bridge cards) + 100px breathing room before h2
      className="relative overflow-hidden bg-[var(--color-brand-blue)] px-4 pb-32 pt-[340px] md:px-16"
    >
      {/* Triangle overlay — rendered once positions are measured */}
      {triDefs.length > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible"
          style={{ width: "100%", height: "100%", zIndex: 0 }}
        >
          <defs>
            {triDefs.map((tri) => (
              <filter key={`f-${tri.id}`} id={`f-${tri.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {triDefs.map((tri) => {
            const h   = tri.size * 0.87;
            const pts = `${tri.cx},${tri.tipY} ${tri.cx - tri.size / 2},${tri.tipY + h} ${tri.cx + tri.size / 2},${tri.tipY + h}`;
            return (
              <g key={tri.id} opacity={tri.opacity}>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={tri.tx}
                  keyTimes="0;0.33;0.66;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                  dur={tri.dur}
                  repeatCount="indefinite"
                />
                <polygon
                  points={pts}
                  fill="none"
                  stroke={tri.color}
                  strokeWidth="5"
                  filter={`url(#f-${tri.id})`}
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="4s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  />
                </polygon>
                <polygon points={pts} fill="none" stroke={tri.color} strokeWidth="2" opacity="1" />
              </g>
            );
          })}
        </svg>
      )}

      <h2
        className="relative z-10 mx-auto mb-16 max-w-[840px] text-center text-[36px] font-bold leading-[1.04] tracking-[-0.02em] text-white sm:text-[48px] md:text-[60px] lg:text-[72px]"
        style={{ fontFamily: "var(--font-league-spartan)", paddingTop: "0.12em", marginTop: "-0.12em" }}
      >
        <span className="block">From Operational</span>
        <span className="block">Challenge to</span>
        <span className="block">Working System.</span>
      </h2>

      <div ref={containerRef} className="relative z-10 mx-auto max-w-5xl">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>

            <div className={`flex ${idx === 4 ? "justify-center" : idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div style={{ width: STEP_W }} className="flex flex-col items-center text-center">

                <div
                  ref={(el) => { circleRefs.current[idx] = el; }}
                  className="relative flex items-center justify-center rounded-full border-[3px]"
                  style={{
                    width: CIRCLE_W, height: CIRCLE_W,
                    borderColor: "rgba(255,255,255,0.3)",
                    color:       "rgba(255,255,255,0.3)",
                    transition:  "border-color 0.3s ease, color 0.3s ease",
                  }}
                >
                  <div
                    ref={(el) => { constructionRefs.current[idx] = el; }}
                    className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
                    style={{ opacity: 0 }}
                  >
                    <ConstructionSVG />
                  </div>
                  <div
                    ref={(el) => { iconRefs.current[idx] = el; }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 0 }}
                  >
                    {step.icon}
                  </div>
                </div>

                <div
                  ref={(el) => { labelRefs.current[idx] = el; }}
                  className="mt-12"
                  style={{ opacity: 0 }}
                >
                  <div className="text-[30px] font-bold tracking-[0.14em] text-white">
                    STEP {step.number}
                  </div>
                  <h3
                    ref={(el) => { h3Refs.current[idx] = el; }}
                    className="mt-2 text-[54px] font-bold leading-tight text-white"
                    style={{ fontFamily: "var(--font-league-spartan)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[36px] leading-relaxed text-white/65">
                    {step.description}
                  </p>
                </div>

              </div>
            </div>

            {idx < steps.length - 1 && (
              <svg width="100%" height={CONNECTOR_H} style={{ display: "block", overflow: "visible" }}>
                <path
                  ref={(el) => { trackRefs.current[idx] = el; }}
                  d="M 0 0"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeDasharray="5 9"
                  fill="none"
                  opacity="0.35"
                />
                <path
                  ref={(el) => { pathRefs.current[idx] = el; }}
                  d="M 0 0"
                  fill="none"
                  stroke="none"
                />
                {Array.from({ length: DOT_COUNT }).map((_, d) => (
                  <circle
                    key={d}
                    ref={(el) => { dotRefs.current[idx][d] = el; }}
                    cx="0" cy="0" r="7"
                    fill="rgba(255,255,255,0.2)"
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
