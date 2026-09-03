"use client";

import { useEffect, useRef } from "react";

import { SECTION_IDS } from "../lib/sections";

const testimonials = [
  {
    name: "Alex Collman",
    role: "Founder, SoilEx",
    paragraphs: [
      "We engaged Simtec as we looked to take our business digital. With a lack of expertise in-house, we needed a partner who could guide us through the minefield.",
      "From day one we got straightforward, honest advice from Joe and his team. They understood our market, our goals and worked to our budget whilst always keeping in mind what might be possible further down the line.",
      "We know we have the right partner in Simtec.",
    ],
  },
  {
    name: "Charlene Quinn",
    role: "Head of Operations, SoilEx Environmental Ltd",
    paragraphs: [
      "We've had the pleasure of working with Simtec on the development of our company portal, and we couldn't be more pleased with the results.",
      "From the outset, the team demonstrated a clear understanding of our operational needs, combining technical expertise with a genuine commitment to delivering a user-friendly, efficient and polished platform.",
      "The portal has already made a noticeable difference in how we manage operations and interact with our clients, streamlining several key processes.",
      "Simtec have proven to be a reliable and innovative partner, and we wouldn't hesitate to recommend them.",
    ],
  },
  {
    name: "Daniel Mallett",
    role: "Commercial Director, Jackson Geo Services",
    paragraphs: [
      "Creating a holistic business management system that supports compliance, management decisions, staff and client requirements had been a goal for our business for years.",
      "What the Simtec team helped us create enabled us to turn that vision into reality.",
      "They listened to our operational needs rather than pushing an out-of-the-box solution.",
    ],
  },
  {
    name: "Kerry Murray",
    role: "Co-Director, Murray Environmental",
    paragraphs: [
      "Joseph goes above and beyond to understand client goals, pain points and operational blockers before building solutions aligned to the needs and culture of the business.",
      "Simtec combines collaboration, agility and operational understanding to deliver systems that genuinely support how organisations work.",
      "Their commitment to improving operational data management makes them a reliable long-term partner.",
    ],
  },
  {
    name: "Steve Edgar",
    role: "Managing Director, Vertase FLI",
    paragraphs: [
      "Simtec listens, understands the requirement and delivers. Rare these days.",
    ],
  },
  {
    name: "Simon Raven",
    role: "CEO, Ecofficiency (Reconomy)",
    paragraphs: [
      "Simtec understands the waste business, gets what you're trying to achieve and delivers.",
    ],
  },
  {
    name: "James Taylor",
    role: "Managing Director, Geotechnical Engineering Ltd",
    paragraphs: [
      "We engaged Simtec to design and build a bespoke site records application to help streamline operational processes across the business.",
      "The outcome was excellent, and the project was managed professionally throughout.",
    ],
  },
  {
    name: "Jonathan Evans",
    role: "Director of Operational Sales, Jacobs",
    paragraphs: [
      "Joseph's intuitive, solution-oriented mindset makes him someone you want involved when tackling operational challenges or embedding new systems.",
      "He quickly understands client requirements and works collaboratively to deliver practical digital solutions aligned to operational needs.",
    ],
  },
  {
    name: "Jacob Loats",
    role: "Head of Data & Visualisations, Vertase FLI",
    paragraphs: [
      "Joe and Andrew have been instrumental in helping us realise our vision and move our business further into the digital world.",
      "Collaboration has been key throughout the process, and with Simtec there is always someone available to help drive the next solution forward.",
    ],
  },
];

type Variant = "cw" | "cd" | "cl" | "cb";

const CARD_STYLE: Record<
  Variant,
  {
    bg: string;
    color: string;
    quoteColor: string;
    ava: { background: string; color: string };
    isDark: boolean;
  }
> = {
  cw: { bg: "#fff",    color: "#1a1530", quoteColor: "rgba(26,21,48,.78)",  ava: { background: "#e4dffa",               color: "#3a2d6e" }, isDark: false },
  cd: { bg: "#1a1530", color: "#fff",    quoteColor: "rgba(255,255,255,.9)", ava: { background: "rgba(255,255,255,0.18)", color: "#fff"   }, isDark: true  },
  cl: { bg: "#e4dffa", color: "#1a1530", quoteColor: "rgba(26,21,48,.82)",  ava: { background: "#1a1530",               color: "#fff"   }, isDark: false },
  cb: {
    bg: "linear-gradient(135deg,#264dd9 0%,#4568f3 100%)",
    color: "#fff", quoteColor: "rgba(255,255,255,.9)",
    ava: { background: "rgba(255,255,255,0.18)", color: "#fff" },
    isDark: true,
  },
};

const FADE_MASK = "linear-gradient(180deg,transparent,#000 10%,#000 90%,transparent)";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function buildCard(idx: number, v: Variant) {
  const t = testimonials[idx];
  const s = CARD_STYLE[v];
  return {
    name: t.name, role: t.role,
    initials: getInitials(t.name),
    quote: "“" + t.paragraphs.join("\n\n") + "”",
    isDark: s.isDark, bg: s.bg, color: s.color, quoteColor: s.quoteColor, ava: s.ava,
  };
}

function Avatar({ initials, bg, color, size, fontSize }: {
  initials: string; bg: string; color: string; size: number; fontSize: number;
}) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 600, letterSpacing: ".02em", background: bg, color }}>
      {initials}
    </div>
  );
}

const featured = buildCard(0, "cd");

const d3base = [
  buildCard(4, "cw"), buildCard(5, "cb"), buildCard(7, "cw"),
  buildCard(3, "cl"), buildCard(6, "cw"), buildCard(8, "cb"),
];
const driftCards = [...d3base, ...d3base];

/* Seconds for one full pass through the six cards — matches the pace of the
   CSS animation this replaced (32s for a 50% translate of the doubled list). */
const DRIFT_SECONDS = 32;

/* Drives the drifting list: a rAF loop moves `offset` down the doubled card
   list, wrapping at the height of one set so the seam is invisible. Hovering
   pauses the drift, and a wheel/trackpad gesture over the list adds straight
   into the same offset — so you can scan the testimonials by hand and the
   drift picks up again from wherever you left it when the pointer leaves.
   The wheel is consumed while the pointer is over the list, so the page does
   not scroll at the same time. */
function useDrift() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const col = colRef.current;
    if (!viewport || !col) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let offset = 0;
    let loop = 0; // height of one set of cards, incl. the gap after the last
    let onScreen = false;
    let hovering = false;
    let prev = 0;
    let raf = 0;

    const measure = () => {
      const first = col.children[0] as HTMLElement | undefined;
      const seam = col.children[d3base.length] as HTMLElement | undefined;
      loop = first && seam ? seam.offsetTop - first.offsetTop : 0;
    };

    const advance = (dy: number) => {
      if (loop <= 0) return;
      offset = (((offset + dy) % loop) + loop) % loop;
      col.style.transform = `translate3d(0,${-offset}px,0)`;
    };

    const tick = (time: number) => {
      const dt = prev ? Math.min(time - prev, 50) : 0;
      prev = time;
      advance((loop / DRIFT_SECONDS) * (dt / 1000));
      raf = requestAnimationFrame(tick);
    };

    /* A CSS animation was the browser's problem to schedule; a rAF loop is
       ours, so it only runs while the drift can actually be seen — the
       section is on screen, the pointer is not parked on it, and the visitor
       has not asked for reduced motion. Wheel scrubbing keeps working in all
       of those states. */
    const sync = () => {
      const drifting = onScreen && !hovering && !reduceMotion.matches;
      if (drifting === Boolean(raf)) return;
      if (drifting) {
        prev = 0; // first frame back measures no elapsed time, so it can't jump
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (loop <= 0) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      // Firefox reports line-based deltas; everything else is already pixels.
      const dy = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (!dy) return;
      event.preventDefault();
      advance(dy);
    };

    const onEnter = () => { hovering = true; sync(); };
    const onLeave = () => { hovering = false; sync(); };

    // observe() delivers an initial observation, so both observers measure and
    // position the list before the first frame without a separate setup pass.
    const resizeObserver = new ResizeObserver(() => {
      measure();
      advance(0);
    });
    resizeObserver.observe(col);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe(viewport);

    reduceMotion.addEventListener("change", sync);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("mouseenter", onEnter);
    viewport.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reduceMotion.removeEventListener("change", sync);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("mouseenter", onEnter);
      viewport.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return { viewportRef, colRef };
}

export function Testimonials() {
  const { viewportRef, colRef } = useDrift();

  return (
    <section id={SECTION_IDS.testimonials} style={{ background: "#ffffff", overflow: "hidden" }}>
      <div
        className="mx-auto px-5 py-14 md:px-10 md:py-[74px] lg:px-20 lg:py-[74px]"
        style={{ maxWidth: 1200 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
          <p className="font-mono mb-[18px] text-[12px] font-medium uppercase tracking-[.22em] text-[#7c7fa0]">
            What clients say
          </p>
          <h2
            className="font-heading tracking-[-0.02em]"
            style={{ fontWeight: 700, lineHeight: 1.04, fontSize: 46, color: "#1a1530" }}
          >
            Their words speak for us.
          </h2>
        </div>

        {/* Featured + drifting list */}
        <div className="testimonials-feat-grid">
          {/* Featured card */}
          <div
            style={{
              borderRadius: "24px 24px 24px 4px",
              padding: 44,
              background: "#1a1530",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 26px 56px -28px rgba(20,26,50,.55)",
            }}
          >
            <blockquote
              className="font-heading tracking-[-0.01em]"
              style={{ fontWeight: 600, fontSize: 25, lineHeight: 1.36, whiteSpace: "pre-line", color: "rgba(255,255,255,.95)" }}
            >
              {featured.quote}
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
              <Avatar initials={featured.initials} bg={featured.ava.background} color={featured.ava.color} size={52} fontSize={16} />
              <div>
                <div className="font-heading" style={{ fontWeight: 600, fontSize: 19, lineHeight: 1.1 }}>{featured.name}</div>
                <div style={{ fontSize: 13, lineHeight: 1.3, marginTop: 3, color: "rgba(255,255,255,.5)" }}>{featured.role}</div>
              </div>
            </div>
          </div>

          {/* Drifting compact list */}
          <div
            ref={viewportRef}
            className="testimonials-drift"
            style={{
              position: "relative",
              overflow: "hidden",
              WebkitMaskImage: FADE_MASK,
              maskImage: FADE_MASK,
            }}
          >
            <div
              ref={colRef}
              style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: 16 }}
            >
              {driftCards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "18px 18px 18px 4px",
                    padding: "22px 24px",
                    border: card.isDark ? undefined : "1px solid rgba(26,21,48,.05)",
                    boxShadow: "0 8px 22px -10px rgba(20,26,50,.22),0 1px 3px rgba(20,26,50,.07)",
                    background: card.bg,
                    color: card.color,
                  }}
                >
                  <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-line", color: card.quoteColor }}>
                    {card.quote}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                    <Avatar initials={card.initials} bg={card.ava.background} color={card.ava.color} size={36} fontSize={12} />
                    <div>
                      <div className="font-heading" style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.1 }}>{card.name}</div>
                      <div style={{ fontSize: 11, lineHeight: 1.3, marginTop: 3, color: card.isDark ? "rgba(255,255,255,.5)" : "rgba(26,21,48,.5)" }}>
                        {card.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
