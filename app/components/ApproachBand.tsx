"use client";

import { useEffect, useRef } from "react";
import { IpadMock } from "./IpadMock";
import { RobotScene } from "./RobotScene";

export function ApproachBand() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="flex min-h-screen flex-col items-center gap-[8vh] px-4 pb-[540px] pt-[8vh] md:px-16"
      style={{ background: "#d9c6ff" }}
    >
      <h2
        className="mx-auto max-w-[760px] text-center text-[42px] font-bold leading-[1.06] tracking-[-0.02em] text-[#1a1530] sm:text-[54px] md:text-[66px]"
        style={{ fontFamily: "var(--font-league-spartan)" }}
      >
        Simtec takes a different approach.
      </h2>

      <div className="mx-auto flex w-full max-w-[680px] flex-col items-center gap-8 md:flex-row md:items-end md:gap-12">

        <div
          ref={wrapperRef}
          className="flex-1"
          style={{
            opacity: 0,
            transform: "translateY(24px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <IpadMock />
        </div>

        <div className="h-[320px] w-[280px] shrink-0">
          <RobotScene />
        </div>

      </div>
    </section>
  );
}
