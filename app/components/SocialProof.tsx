"use client";

import Image from "next/image";
import { useRef } from "react";
import { useScrollEffect } from "../hooks/useScrollEffect";

export function SocialProof() {
  const GAP = 32;
  const LEFT_W = 300;
  const WHITE_W = 280;
  const HEART_SIZE = 270;
  const BLUE_H = 300;
  const WHITE_H = 420;
  const ROW2_H = 260;
  const ROW1_TOTAL = LEFT_W + GAP + HEART_SIZE + GAP + WHITE_W; // 914px
  // Testimonial starts at blue card's right edge, ends at white card's right edge
  const TESTIMONIAL_W = ROW1_TOTAL - LEFT_W; // 614px

  const sectionRef = useRef<HTMLElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  useScrollEffect(() => {
    const section = sectionRef.current;
    const heart = heartRef.current;
    if (!section || !heart) return;
    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    heart.style.transform = `translateY(${progress * (WHITE_H - HEART_SIZE)}px)`;
  });

  return (
    <section ref={sectionRef} className="px-4 py-24 md:px-16" style={{ background: "#f8f1fe" }}>
      <div className="mx-auto max-w-[var(--container-content)]">

        {/* Heading */}
        <h2
          className="mx-auto mb-14 max-w-[640px] text-center text-[40px] font-bold leading-[1.06] tracking-[-0.02em] text-[#1a1530] sm:text-[52px] md:text-[60px]"
          style={{ fontFamily: "var(--font-league-spartan)" }}
        >
          Companies love us and it shows.
        </h2>

        {/* Rows wrapper — centered at row 1 total width */}
        <div className="mx-auto flex flex-col" style={{ maxWidth: ROW1_TOTAL, gap: GAP }}>

          {/* Row 1 — fills wrapper exactly */}
          <div className="flex items-start" style={{ gap: GAP }}>

            {/* Blue card — vertically centered against white card */}
            <div
              className="flex shrink-0 flex-col items-center justify-center p-7 text-center"
              style={{
                width: LEFT_W,
                height: BLUE_H,
                marginTop: (WHITE_H - BLUE_H) / 2,
                background: "linear-gradient(135deg, #3535d8 0%, #5a4af2 100%)",
                borderRadius: "28px 28px 28px 0",
              }}
            >
              <p className="text-[72px] font-bold leading-none tracking-tight text-white" style={{ fontFamily: "var(--font-league-spartan)" }}>
                25+
              </p>
              <p className="mt-2 text-[14px] font-medium text-white/70">happy clients</p>
            </div>

            {/* Heart */}
            <div
              ref={heartRef}
              className="flex shrink-0 items-center justify-center"
              style={{ width: HEART_SIZE, height: HEART_SIZE, willChange: "transform" }}
            >
              <Image src="/heart.svg" alt="" width={HEART_SIZE} height={HEART_SIZE} style={{ objectFit: "contain" }} />
            </div>

            {/* White card */}
            <div
              className="flex shrink-0 flex-col justify-start bg-white p-7 pt-[48px]"
              style={{
                width: WHITE_W,
                height: WHITE_H,
                borderRadius: "28px 28px 28px 0",
              }}
            >
              <p className="text-[72px] font-bold leading-none tracking-tight text-[#1a1530]" style={{ fontFamily: "var(--font-league-spartan)" }}>
                95%
              </p>
              <p className="mt-3 text-[22px] font-medium leading-snug text-[#1a1530]/60">
                of clients stay with us<br />for over 4 years
              </p>
            </div>
          </div>

          {/* Row 2 — overflows GAP to the left so lavender shifts left, right edge stays aligned */}
          <div className="flex items-start" style={{ gap: GAP, marginLeft: -GAP }}>

            {/* Lavender card — marginTop: -GAP keeps it flush with row 1 bottom */}
            <div
              className="flex shrink-0 flex-col items-center justify-center p-7 text-center"
              style={{
                width: LEFT_W,
                height: ROW2_H,
                marginTop: -GAP,
                background: "#e4dffa",
                borderRadius: "28px 0 28px 28px",
              }}
            >
              <p className="text-[72px] font-bold leading-none tracking-tight text-[#1a1530]" style={{ fontFamily: "var(--font-league-spartan)" }}>
                4.9/5
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#1a1530]/60">client satisfaction score</p>
            </div>

            {/* Dark testimonial — starts at blue card right edge, ends at white card right edge */}
            <div
              className="flex shrink-0 flex-col justify-between p-8"
              style={{
                width: TESTIMONIAL_W,
                minHeight: ROW2_H,
                background: "#1a1530",
                borderRadius: "0 28px 28px 28px",
              }}
            >
              <p className="text-[24px] font-medium leading-relaxed text-white/90">
                "Joe and Andrew have been instrumental in helping us realise our vision and move our business further into the digital world. Collaboration has been key throughout the process, and with Simtec there is always someone available to help drive the next solution forward."
              </p>
              <div className="mt-6">
                <p className="text-[14px] font-semibold text-white">Jonathan Evans</p>
                <p className="text-[12px] text-white/40">Director of Operational Sales, Jacobs</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
