"use client";

import { useEffect, useRef } from "react";
import { RobotScene } from "./RobotScene";

export function ApproachBand() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          imgEl.style.opacity = "1";
          imgEl.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(imgEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="flex min-h-screen flex-col items-center justify-between px-4 pb-16 pt-24 md:px-16"
      style={{ background: "#d9c6ff" }}
    >
      <h2
        className="mx-auto max-w-[760px] text-center text-[42px] font-bold leading-[1.06] tracking-[-0.02em] text-[#1a1530] sm:text-[54px] md:text-[66px]"
        style={{ fontFamily: "var(--font-league-spartan)" }}
      >
        Simtec takes a different approach.
      </h2>

      <div className="mx-auto flex w-full max-w-[680px] flex-col items-center gap-8 md:flex-row md:items-end md:gap-12">

        <div className="relative flex-1">
          <style>{`
            @keyframes ap-pulse {
              0%   { transform: scale(.8); opacity: .8; }
              60%  { transform: scale(1.6); opacity: 0; }
              100% { transform: scale(.8); opacity: 0;  }
            }
            @keyframes ap-ring {
              0%   { transform: scale(1);   opacity: .6; }
              100% { transform: scale(1.8); opacity: 0;  }
            }
            .ap-pulse::after {
              content: '';
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              border: 2px solid rgba(0,220,255,.25);
              animation: ap-ring 2.7s ease-out 0s infinite;
            }
          `}</style>
          <img
            ref={imgRef}
            src="/mockup2.png"
            alt="Before building systems, we understand your workflows"
            className="w-full"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          />
          {/* Bleep pulse — positioned over the screen area of the mockup */}
          <div
            className="ap-pulse pointer-events-none absolute rounded-full"
            style={{
              bottom: "8%", right: "14%",
              width: 42, height: 42,
              background: "rgba(0,220,255,.3)",
              animation: "ap-pulse 2.7s ease-out 0s infinite",
            }}
          />
        </div>

        <div className="h-[320px] w-[280px] shrink-0">
          <RobotScene />
        </div>

      </div>
    </section>
  );
}
