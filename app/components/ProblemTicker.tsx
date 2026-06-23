"use client";

import { useEffect, useRef, useState } from "react";
import { TickerFades } from "./TickerFades";

const BASE = [
  "Spreadsheets controlling critical workflows",
  "Teams chasing information across disconnected systems",
  "Duplicate admin and manual reporting",
  "Site teams working outside operational processes",
  "Compliance reporting taking too long",
  "Poor visibility across projects and teams",
  "Inconsistent workflows between departments",
  "Operational knowledge sitting with individuals",
  "Systems that nobody fully trusts or adopts",
];

const TRACK     = [...BASE, ...BASE, ...BASE];
const START_IDX = BASE.length;
const PAUSE_MS  = 2200;
const TRANS_MS  = 650;

export function ProblemTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef    = useRef(START_IDX);

  const [active,         setActive]         = useState(START_IDX);
  const [tx,             setTx]             = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  const computeTx = (idx: number) => {
    const c  = containerRef.current;
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
      setActive(a => a + 1);
    }, PAUSE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    activeRef.current = active;
    setTx(computeTx(active));

    if (active >= BASE.length * 2) {
      const t = setTimeout(() => {
        const snapped = active - BASE.length;
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
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-[var(--color-surface-container-low)] py-14"
    >
      <TickerFades color="var(--color-surface-container-low)" widthClass="w-36 md:w-56" />

      {/* Label */}
      <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-outline)]">
        Common challenges
      </p>

      {/* Scrolling track */}
      <div
        className="flex items-center"
        style={{
          gap: "5rem",
          transform: `translateX(${tx}px)`,
          transition: withTransition ? `transform ${TRANS_MS}ms cubic-bezier(0.4,0,0.2,1)` : "none",
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
              style={{
                fontSize:   "clamp(22px, 3vw, 42px)",
                color:      dist === 0 ? "var(--color-on-surface)" : "var(--color-outline-variant)",
                transition: `color ${TRANS_MS}ms ease`,
              }}
            >
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}
