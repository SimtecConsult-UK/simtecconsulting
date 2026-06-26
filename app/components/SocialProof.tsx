"use client";

import Image from "next/image";
import { useRef } from "react";
import { useScrollEffect } from "../hooks/useScrollEffect";

const DROP = "0 12px 32px rgba(0,0,0,0.22), 0 40px 96px rgba(0,0,0,0.18)";
const SHADOW = {
  green:  `${DROP}, inset 0 1px 0 rgba(255,255,255,0.30)`,
  purple: `${DROP}, inset 0 1px 0 rgba(255,255,255,0.15)`,
  pink:   `${DROP}, inset 0 1px 0 rgba(255,255,255,0.25)`,
  dark:   `${DROP}, inset 0 1px 0 rgba(255,255,255,0.05)`,
};

export function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  useScrollEffect(() => {
    if (window.innerWidth < 768) return;
    const section = sectionRef.current;
    const heart = heartRef.current;
    if (!section || !heart) return;
    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    // travel distance scales with breakpoint: desktop=150px, tablet=116px
    const whiteH = window.innerWidth >= 1024 ? 420 : 324;
    const heartSize = window.innerWidth >= 1024 ? 270 : 208;
    heart.style.transform = `translateY(${progress * (whiteH - heartSize)}px)`;
  });

  return (
    <section ref={sectionRef} className="bg-white px-5 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
      {/* CSS vars for tablet vs desktop card dimensions + shimmer */}
      <style>{`
        .sp-rows {
          --sp-gap: 24px;
          --sp-left-w: 231px;
          --sp-white-w: 217px;
          --sp-heart: 208px;
          --sp-green-h: 231px;
          --sp-white-h: 324px;
          --sp-row2-h: 200px;
        }
        @media (min-width: 1024px) {
          .sp-rows {
            --sp-gap: 32px;
            --sp-left-w: 300px;
            --sp-white-w: 280px;
            --sp-heart: 270px;
            --sp-green-h: 300px;
            --sp-white-h: 420px;
            --sp-row2-h: 260px;
          }
        }

        /* Shimmer sweep — continuous slow pendulum */
        .sp-shine {
          position: relative;
          overflow: hidden;
        }
        .sp-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            108deg,
            transparent 25%,
            rgba(255, 255, 255, 0.11) 50%,
            transparent 75%
          );
          animation: sp-shine-sweep 5s ease-in-out infinite alternate;
          animation-delay: var(--sp-shine-delay, 0s);
          pointer-events: none;
        }
        .sp-shine-dim::after {
          background: linear-gradient(
            108deg,
            transparent 25%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 75%
          );
        }
        @keyframes sp-shine-sweep {
          from { transform: translateX(-130%); }
          to   { transform: translateX(130%); }
        }
      `}</style>

      <div className="mx-auto max-w-[var(--container-content)]">

        {/* Heading */}
        <h2 className="font-heading mx-auto mb-8 max-w-[640px] text-center text-[34px] font-bold leading-[1.06] tracking-[-0.02em] text-[#1a1530] md:mb-11 md:text-[40px] lg:mb-14 lg:text-[52px]">
          Companies love us and it shows.
        </h2>

        {/* ===== MOBILE LAYOUT (< 768px) ===== */}
        <div className="flex flex-col items-center md:hidden">
          {/* Heart — static on mobile, no animation */}
          <div className="mb-7 flex justify-center">
            <Image src="/heart.svg" alt="" width={120} height={120} style={{ objectFit: "contain" }} />
          </div>

          {/* Two stat cards side by side */}
          <div className="mb-3 flex w-full max-w-[350px] gap-3">
            <div
              className="sp-shine flex flex-1 flex-col items-center justify-center p-5 text-center"
              style={{
                height: 160,
                background: "linear-gradient(135deg, #5ccfc2 0%, #8fe7da 100%)",
                borderRadius: "20px 20px 20px 0",
                boxShadow: SHADOW.green,
                ["--sp-shine-delay" as string]: "0s",
              }}
            >
              <p className="font-heading text-[44px] font-bold leading-none tracking-tight text-white">25+</p>
              <p className="mt-1.5 text-[11px] font-medium text-white/70">happy clients</p>
            </div>
            <div
              className="sp-shine flex flex-1 flex-col items-center justify-center p-5 text-center"
              style={{
                height: 160,
                background: "#e46897",
                borderRadius: "20px 20px 0 20px",
                boxShadow: SHADOW.pink,
                ["--sp-shine-delay" as string]: "1.25s",
              }}
            >
              <p className="font-heading text-[44px] font-bold leading-none tracking-tight text-white">4.9/5</p>
              <p className="mt-1.5 text-[11px] font-medium text-white/80">client satisfaction score</p>
            </div>
          </div>

          {/* Dark testimonial */}
          <div
            className="sp-shine sp-shine-dim flex w-full max-w-[350px] flex-col justify-between p-6"
            style={{ background: "#1a1530", borderRadius: "0 20px 20px 20px", minHeight: 180, boxShadow: SHADOW.dark, ["--sp-shine-delay" as string]: "2.5s" }}
          >
            <p className="text-[15px] font-medium leading-relaxed text-white/90">
              &ldquo;Joe and Andrew have been instrumental in helping us realise our vision and move our business further into the digital world. Collaboration has been key throughout the process, and with Simtec there is always someone available to help drive the next solution forward.&rdquo;
            </p>
            <div className="mt-4">
              <p className="text-[12px] font-semibold text-white">Jonathan Evans</p>
              <p className="text-[10px] text-white/40">Director of Operational Sales, Jacobs</p>
            </div>
          </div>

          {/* Purple 95% card */}
          <div
            className="sp-shine mt-3 w-full max-w-[350px] rounded-[20px] p-6"
            style={{ background: "#7b2bd8", boxShadow: SHADOW.purple, ["--sp-shine-delay" as string]: "3.75s" }}
          >
            <p className="font-heading text-[44px] font-bold leading-none tracking-tight text-white">95%</p>
            <p className="mt-2 text-[14px] font-medium leading-snug text-white/70">
              of clients stay with us for over 4 years
            </p>
          </div>
        </div>

        {/* ===== TABLET+ LAYOUT (≥ 768px) ===== */}
        <div
          className="sp-rows mx-auto hidden flex-col md:flex"
          style={{
            maxWidth: "calc(var(--sp-left-w) + var(--sp-gap) + var(--sp-heart) + var(--sp-gap) + var(--sp-white-w))",
            gap: "var(--sp-gap)",
          }}
        >

          {/* Row 1 */}
          <div className="flex items-start" style={{ gap: "var(--sp-gap)" }}>

            {/* Green card */}
            <div
              className="sp-shine flex shrink-0 flex-col items-center justify-center text-center"
              style={{
                width: "var(--sp-left-w)",
                height: "var(--sp-green-h)",
                padding: "22px",
                marginTop: "calc((var(--sp-white-h) - var(--sp-green-h)) / 2)",
                background: "linear-gradient(135deg, #5ccfc2 0%, #8fe7da 100%)",
                borderRadius: "28px 28px 28px 0",
                boxShadow: SHADOW.green,
                ["--sp-shine-delay" as string]: "0s",
              }}
            >
              <p className="font-heading text-[56px] font-bold leading-none tracking-tight text-white lg:text-[72px]">25+</p>
              <p className="mt-2 text-[11px] font-medium text-white/70 lg:text-[14px]">happy clients</p>
            </div>

            {/* Heart — animated on tablet and desktop */}
            <div
              ref={heartRef}
              className="flex shrink-0 items-center justify-center"
              style={{ width: "var(--sp-heart)", height: "var(--sp-heart)", willChange: "transform" }}
            >
              <Image
                src="/heart.svg"
                alt=""
                width={270}
                height={270}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            {/* 95% card */}
            <div
              className="sp-shine flex shrink-0 flex-col justify-start"
              style={{
                width: "var(--sp-white-w)",
                height: "var(--sp-white-h)",
                padding: "37px 22px 22px",
                borderRadius: "28px 28px 28px 0",
                background: "#7b2bd8",
                boxShadow: SHADOW.purple,
                ["--sp-shine-delay" as string]: "1.25s",
              }}
            >
              <p className="font-heading text-[56px] font-bold leading-none tracking-tight text-white lg:text-[72px]">95%</p>
              <p className="mt-3 text-[17px] font-medium leading-snug text-white/70 lg:text-[22px]">
                of clients stay with us<br />for over 4 years
              </p>
            </div>
          </div>

          {/* Row 2 — offset left by one gap so dark card's right edge aligns with white card */}
          <div
            className="flex items-start"
            style={{ gap: "var(--sp-gap)", marginLeft: "calc(-1 * var(--sp-gap))" }}
          >

            {/* Pink card */}
            <div
              className="sp-shine flex shrink-0 flex-col items-center justify-center text-center"
              style={{
                width: "var(--sp-left-w)",
                height: "var(--sp-row2-h)",
                padding: "22px",
                marginTop: "calc(-1 * var(--sp-gap))",
                background: "#e46897",
                borderRadius: "28px 0 28px 28px",
                boxShadow: SHADOW.pink,
                ["--sp-shine-delay" as string]: "2.5s",
              }}
            >
              <p className="font-heading text-[56px] font-bold leading-none tracking-tight text-white lg:text-[72px]">4.9/5</p>
              <p className="mt-2 text-[11px] font-medium text-white/80 lg:text-[14px]">client satisfaction score</p>
            </div>

            {/* Dark testimonial */}
            <div
              className="sp-shine sp-shine-dim flex shrink-0 flex-col justify-between p-6 lg:p-8"
              style={{
                width: "calc(var(--sp-heart) + var(--sp-gap) + var(--sp-white-w))",
                minHeight: "var(--sp-row2-h)",
                background: "#1a1530",
                borderRadius: "0 28px 28px 28px",
                boxShadow: SHADOW.dark,
                ["--sp-shine-delay" as string]: "3.75s",
              }}
            >
              <p className="text-[14px] font-medium leading-relaxed text-white/90 lg:text-[18px]">
                &ldquo;Joe and Andrew have been instrumental in helping us realise our vision and move our business further into the digital world. Collaboration has been key throughout the process, and with Simtec there is always someone available to help drive the next solution forward.&rdquo;
              </p>
              <div className="mt-4 lg:mt-6">
                <p className="text-[11px] font-semibold text-white lg:text-[14px]">Jonathan Evans</p>
                <p className="text-[10px] text-white/40 lg:text-[12px]">Director of Operational Sales, Jacobs</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
