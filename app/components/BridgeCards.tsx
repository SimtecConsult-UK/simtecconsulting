"use client";

import { useEffect, useRef } from "react";

const CARD_OFFSET = 60; // px: vertical parallax amplitude

function ShieldIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-14 w-14" aria-hidden>
      <path
        d="M28 5L9 14.5v12.8C9 39.6 17.1 50.6 28 54c10.9-3.4 19-14.4 19-26.7V14.5L28 5z"
        fill="var(--color-brand-blue)"
      />
      <path
        d="M20 28.5l5.5 5.5 10.5-12"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-14 w-14" aria-hidden>
      <circle cx="10" cy="47" r="3" fill="#ff6b6b" />
      <circle cx="18" cy="39" r="3" fill="#ff6b6b" />
      <circle cx="26" cy="31" r="3" fill="#ff6b6b" />
      <circle cx="36" cy="37" r="3" fill="#ff6b6b" />
      <circle cx="44" cy="21" r="3" fill="#ff6b6b" />
      <circle cx="50" cy="13" r="3" fill="#ff6b6b" />
      <path
        d="M10 47L50 13"
        stroke="#ff6b6b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path
        d="M38 11h12v12"
        stroke="#ff6b6b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BridgeCards() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const leftCardRef  = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      const left    = leftCardRef.current;
      const right   = rightCardRef.current;
      if (!wrapper || !left || !right) return;

      const rect     = wrapper.getBoundingClientRect();
      const vh       = window.innerHeight;

      // 0 when boundary line is at viewport bottom, 1 when at viewport top
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));

      const leftY  = -CARD_OFFSET + progress * 2 * CARD_OFFSET;
      const rightY =  CARD_OFFSET - progress * 2 * CARD_OFFSET;

      left.style.transform  = `translateY(${leftY}px)`;
      right.style.transform = `translateY(${rightY}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // height: 0 — doesn't consume layout space; cards straddle the boundary via translateY(-50%)
    <div
      ref={wrapperRef}
      className="relative z-30 overflow-visible"
      style={{ height: 0 }}
    >
      {/* Flex row centered on the boundary line, shifted up by 50% of its own height */}
      <div
        className="absolute left-0 right-0 flex justify-center gap-8 px-4"
        style={{ top: 0, transform: "translateY(-50%)" }}
      >
        {/* Left card — light */}
        <div
          ref={leftCardRef}
          className="flex w-[280px] shrink-0 flex-col items-center justify-center rounded-full bg-[#f5f4ff] px-9 py-16 text-center"
          style={{ minHeight: 480, willChange: "transform" }}
        >
          <div className="mb-7">
            <ShieldIcon />
          </div>
          <h3
            className="text-[22px] font-bold leading-tight text-[#0e141e]"
            style={{ fontFamily: "var(--font-league-spartan)" }}
          >
            Privacy at the core.
          </h3>
          <p className="mt-4 text-[14px] leading-relaxed text-[#444655]">
            Built on a foundation of uncompromising standards and protocols, ensuring robust protection for sensitive data.
          </p>
        </div>

        {/* Right card — dark */}
        <div
          ref={rightCardRef}
          className="flex w-[280px] shrink-0 flex-col items-center justify-center rounded-full bg-[#0e141e] px-9 py-16 text-center"
          style={{ minHeight: 480, willChange: "transform" }}
        >
          <div className="mb-7">
            <GrowthIcon />
          </div>
          <h3
            className="text-[22px] font-bold leading-tight text-white"
            style={{ fontFamily: "var(--font-league-spartan)" }}
          >
            Success at scale.
          </h3>
          <p className="mt-4 text-[14px] leading-relaxed text-white/65">
            Our cloud-native platform ensures compliance and effortless maintenance, so you can focus on benefit delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
