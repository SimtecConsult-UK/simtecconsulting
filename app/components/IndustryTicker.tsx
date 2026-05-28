"use client";

import { useEffect, useRef, useState } from "react";

const BASE = ["Construction", "Environmental", "Infrastructure"];
// Triple the list so there's always content on both sides of the active item
const TRACK = [...BASE, ...BASE, ...BASE];
const START_IDX  = BASE.length; // begin at the middle set (index 3)
const PAUSE_MS   = 2000;
const TRANS_MS   = 650;

export function IndustryTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef    = useRef(START_IDX);

  const [active, setActive]           = useState(START_IDX);
  const [tx, setTx]                   = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  // Calculate translateX so that item[idx] is centred in the container
  const computeTx = (idx: number) => {
    const c  = containerRef.current;
    const el = itemRefs.current[idx];
    if (!c || !el) return 0;
    return c.offsetWidth / 2 - el.offsetLeft - el.offsetWidth / 2;
  };

  // Recalculate on resize
  useEffect(() => {
    const onResize = () => setTx(computeTx(activeRef.current));
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Advance every PAUSE_MS
  useEffect(() => {
    const id = setInterval(() => {
      setWithTransition(true);
      setActive(a => a + 1);
    }, PAUSE_MS);
    return () => clearInterval(id);
  }, []);

  // When active changes: update translate, and handle seamless loop reset
  useEffect(() => {
    activeRef.current = active;
    setTx(computeTx(active));

    // Once we've slid into the third set, snap back to the matching slot in
    // the second set (identical visual position) without animation
    if (active >= BASE.length * 2) {
      const t = setTimeout(() => {
        const snapped = active - BASE.length;
        setWithTransition(false);
        setActive(snapped);
        // Two rAFs ensure React flushes the no-transition render before we
        // re-enable, so the next interval animates normally
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
      {/* Edge fade masks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-36 md:w-56"
        style={{ background: "linear-gradient(to right, var(--color-surface-container-low), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-36 md:w-56"
        style={{ background: "linear-gradient(to left, var(--color-surface-container-low), transparent)" }}
      />

      {/* Label */}
      <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-outline)]">
        Solutions for
      </p>

      {/* Scrolling track */}
      <div
        className="flex items-center"
        style={{
          gap: "4.5rem",
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
              className="select-none whitespace-nowrap font-bold"
              style={{
                fontFamily: "var(--font-league-spartan)",
                fontSize: "clamp(38px, 5vw, 66px)",
                color: dist === 0 ? "var(--color-on-surface)" : "var(--color-outline-variant)",
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
