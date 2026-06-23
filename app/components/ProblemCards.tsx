"use client";

import { useEffect, useRef, useState } from "react";

const problems = [
  "Spreadsheets controlling critical workflows",
  "Teams chasing information across disconnected systems",
  "Duplicate admin and manual reporting",
  "Site teams working outside operational processes",
  "Compliance reporting taking too long",
  "Poor visibility across projects and teams",
  "Inconsistent workflows between departments",
  "Operational knowledge sitting with individuals rather than the business",
  "Systems that nobody fully trusts or adopts",
];

const TRACK = [...problems, ...problems, ...problems];
const START_IDX = problems.length;
const PAUSE_MS = 2800;
const TRANS_MS = 650;

export function ProblemCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef(START_IDX);

  const [active, setActive] = useState(START_IDX);
  const [tx, setTx] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  const computeTx = (idx: number) => {
    const c = containerRef.current;
    const el = itemRefs.current[idx];
    if (!c || !el) return 0;
    return c.offsetWidth / 2 - el.offsetLeft - el.offsetWidth / 2;
  };

  useEffect(() => {
    const onResize = () => setTx(computeTx(activeRef.current));
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWithTransition(true);
      setActive((a) => a + 1);
    }, PAUSE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    activeRef.current = active;
    setTx(computeTx(active));

    if (active >= problems.length * 2) {
      const t = setTimeout(() => {
        const snapped = active - problems.length;
        setWithTransition(false);
        setActive(snapped);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setWithTransition(true))
        );
      }, TRANS_MS + 80);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    // No overflow-hidden here — lets the parent's blobs paint through uninterrupted
    <div ref={containerRef} className="relative py-14">

      {/* Label */}
      <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-outline)]">
        We Help Solve
      </p>

      {/* Overflow clip + opacity-based edge fades via mask-image (colour-independent) */}
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >

        {/* Scrolling track */}
        <div
          className="flex items-center"
          style={{
            gap: "5rem",
            transform: `translateX(${tx}px)`,
            transition: withTransition ? `transform ${TRANS_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
            willChange: "transform",
          }}
        >
          {TRACK.map((item, i) => {
            const dist = Math.abs(i - active);
            return (
              <span
                key={i}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="font-heading select-none whitespace-nowrap font-bold"
                style={
                  dist === 0
                    ? {
                        fontSize: "clamp(26px, 3vw, 52px)",
                        backgroundImage: "linear-gradient(90deg, #ff5db3 0%, #b04df0 50%, #6eeada 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                      }
                    : {
                        fontSize: "clamp(26px, 3vw, 52px)",
                        color: "var(--color-outline-variant)",
                        WebkitTextFillColor: "var(--color-outline-variant)",
                        transition: `color ${TRANS_MS}ms ease`,
                      }
                }
              >
                {item}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
