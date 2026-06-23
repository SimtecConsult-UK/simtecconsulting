"use client";

import { useState, useEffect, useRef } from "react";

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

const N = testimonials.length; // 9
// Triple the array so both ends have clones for seamless looping
const EXTENDED = [...testimonials, ...testimonials, ...testimonials];

const PEEK = 80;
const GAP = 24;
const OFFSET = PEEK + GAP; // 104px — left edge of the first full card

export function Testimonials() {
  // Start at N+1 so t[0] peeks on the left and t[1], t[2] are fully visible
  const [rawIndex, setRawIndex] = useState(N + 1);
  const [animated, setAnimated] = useState(true);
  const [cardWidth, setCardWidth] = useState(460);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(true);

  useEffect(() => {
    animatedRef.current = animated;
  }, [animated]);

  // Measure container and calculate card width responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      setCardWidth(Math.floor((w - 2 * PEEK - 3 * GAP) / 2));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Snap back to the middle set after entering a clone zone (invisible jump)
  useEffect(() => {
    let snapTo: number | null = null;
    if (rawIndex >= 2 * N) {
      snapTo = rawIndex - N;
    } else if (rawIndex < N) {
      snapTo = rawIndex + N;
    }
    if (snapTo === null) return;

    const timer = setTimeout(() => {
      setAnimated(false);
      setRawIndex(snapTo!);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    }, 520); // just after the 500ms slide transition
    return () => clearTimeout(timer);
  }, [rawIndex]);

  // Horizontal trackpad swipe → navigate
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cooldown = false;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (cooldown || !animatedRef.current) return;
      if (e.deltaX > 30) {
        cooldown = true;
        setRawIndex(i => i + 1);
        setTimeout(() => { cooldown = false; }, 600);
      } else if (e.deltaX < -30) {
        cooldown = true;
        setRawIndex(i => i - 1);
        setTimeout(() => { cooldown = false; }, 600);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const prev = () => { if (animatedRef.current) setRawIndex(i => i - 1); };
  const next = () => { if (animatedRef.current) setRawIndex(i => i + 1); };

  return (
    <section style={{ background: "#f8f1fe" }} className="pb-24 pt-0">

      {/* Heading + arrows — centered */}
      <div className="px-4 md:px-16">
        <div className="mx-auto max-w-[var(--container-content)]">
          <h2
            className="font-heading text-center text-[40px] font-bold leading-[1.06] tracking-[-0.02em] text-[#1a1530] sm:text-[52px] md:text-[60px]"
          >
            Their words speak for us.
          </h2>

          <div className="mt-10 mb-12 flex justify-center gap-3">
            <button
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1530] text-white transition-opacity hover:opacity-80"
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 3.5L6 9l5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1530] text-white transition-opacity hover:opacity-80"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 3.5L12 9l-5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Full-width carousel */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex items-start"
          style={{
            gap: GAP,
            transform: `translateX(${OFFSET - rawIndex * (cardWidth + GAP)}px)`,
            transition: animated ? "transform 500ms ease-in-out" : "none",
          }}
        >
          {EXTENDED.map((t, i) => (
            <div
              key={i}
              className="shrink-0 rounded-[24px] bg-white p-8"
              style={{ width: cardWidth }}
            >
              {/* Avatar placeholder */}
              <div className="h-10 w-10 rounded-full bg-[#e4dffa]" />

              {/* Name & role */}
              <p
                className="font-heading mt-4 text-[18px] font-bold text-[#1a1530]"
              >
                {t.name}
              </p>
              <p className="text-[13px] font-medium text-[#1a1530]/50">{t.role}</p>

              {/* Quote */}
              <div className="mt-5 space-y-3">
                {t.paragraphs.map((p, j) => (
                  <p key={j} className="text-[15px] leading-relaxed text-[#1a1530]/70">
                    {j === 0 ? `"${p}` : p}{j === t.paragraphs.length - 1 ? '"' : ""}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
