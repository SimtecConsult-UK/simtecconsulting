"use client";

import { useEffect, useRef } from "react";

export function PainPointBand() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const card = cardRef.current;
    if (!wrapper || !card) return;

    const onScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrolled = -rect.top;
      const extra = wrapper.offsetHeight - vh;

      if (scrolled <= 0) {
        card.style.transform = "scale(0.62)";
        card.style.borderRadius = "32px";
        card.style.overflow = "hidden";
        return;
      }

      const progress = Math.min(scrolled / extra, 1);
      const scale = 0.62 + progress * 0.32;
      const radius = 32 - progress * 16;
      card.style.transform = `scale(${scale})`;
      card.style.borderRadius = `${radius}px`;
      card.style.overflow = "hidden";
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    /* Wrapper is 2× viewport tall — the extra height is the scroll travel */
    <div ref={wrapperRef} style={{ height: "200vh", background: "var(--color-surface-container-low)" }}>
      <div
        ref={cardRef}
        className="sticky top-0 flex h-screen w-full flex-col items-center justify-center bg-[var(--color-brand-blue)]"
        style={{
          transformOrigin: "center center",
          willChange: "transform, border-radius",
        }}
      >
        <h2 className="mx-auto max-w-[1100px] text-center text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0c2421] sm:text-[38px] md:text-[48px] lg:text-[58px]" style={{ fontFamily: "var(--font-league-spartan)" }}>
          Construction businesses are often forced into rigid workflows, disconnected systems, generic software platforms, and poorly adopted processes.
        </h2>
      </div>
    </div>
  );
}
