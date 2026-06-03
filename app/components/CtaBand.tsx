"use client";

import { useEffect, useRef, useState } from "react";
import { RobotScene } from "./RobotScene";

export function CtaBand() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-4 py-24 md:px-16" style={{ background: "#f8f1fe" }}>
      <div className="mx-auto max-w-[var(--container-content)]">

        {/* Wrapper — relative so the robot can escape the card */}
        <div className="relative">

          {/* Blue card */}
          <div
            ref={cardRef}
            className="overflow-hidden rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #3535d8 0%, #5a4af2 100%)",
              minHeight: "500px",
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(32px)",
              transition: "opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Left text */}
            <div className="flex h-full flex-col justify-center px-10 py-16 md:px-16 md:py-20 lg:max-w-[56%]">

              <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white/50">
                Get started
              </p>

              <h2
                className="text-[40px] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-[48px] md:text-[56px]"
                style={{ fontFamily: "var(--font-league-spartan)" }}
              >
                Free Operational Discovery Workshop.
              </h2>

              <p className="mt-5 text-[13px] font-semibold uppercase tracking-wider text-white/40">
                Workshop outputs include:
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  "High-level workflow review",
                  "Operational bottleneck identification",
                  "Digitisation opportunities",
                  "Initial system recommendations",
                  "High-level operational system proposal",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[15px] text-white/75">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href="#"
                  className="inline-flex items-center rounded-full px-7 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
                >
                  Book a Workshop
                  <svg className="ml-2 h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
                <p className="mt-3 text-[13px] text-white/40">
                  *With no obligation to proceed
                </p>
              </div>
            </div>
          </div>

          {/* Robot — sibling to card so it escapes top & bottom overflow */}
          <div
            className="pointer-events-none absolute right-0 hidden w-[44%] md:block"
            style={{ top: "-80px", bottom: "-80px" }}
          >
            <RobotScene />
          </div>

        </div>
      </div>
    </section>
  );
}
