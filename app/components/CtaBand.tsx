"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "../lib/sections";

const OUTPUTS = [
  "High-level workflow review",
  "Operational bottleneck identification",
  "Digitisation opportunities",
  "Initial system recommendations",
  "High-level operational system proposal",
];

export function CtaBand() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-6 py-10 md:px-10 md:py-14 xl:px-20 xl:py-20" style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-[1760px]">
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[28px] bg-[#0a0b0e]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.65s ease-out, transform 0.65s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Blueprint grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(45,212,191,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,.07) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />
          {/* Teal radial glow (right side) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(90% 120% at 78% 60%, rgba(45,212,191,.22) 0%, transparent 55%)" }}
          />

          {/* Inner layout */}
          <div className="relative grid min-h-[540px] grid-cols-1 lg:grid-cols-[1fr_500px]">
            {/* ── Text column ── */}
            <div className="flex flex-col justify-center px-7 py-12 lg:py-16 lg:pl-16 lg:pr-4">
              <p className="font-mono mb-5 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2dd4bf]">
                Get started
              </p>

              <h2 className="font-heading max-w-[470px] text-[46px] font-bold leading-[1.02] tracking-[-0.02em] text-white">
                Free Operational Discovery Workshop.
              </h2>

              <p className="font-mono mb-3.5 mt-7 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/[0.38]">
                Workshop outputs include
              </p>

              <ul className="flex list-none flex-col gap-[9px]">
                {OUTPUTS.map((item) => (
                  <li key={item} className="flex items-center gap-[11px] text-[15px] text-white/[0.82]">
                    <span className="font-mono shrink-0 text-[12px] font-medium leading-none text-[#2dd4bf]">+</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-start gap-3">
                <a
                  href={ROUTES.discovery}
                  className="font-sans inline-flex items-center gap-[9px] rounded-[8px] bg-[#2dd4bf] px-[26px] py-3.5 text-[15px] font-semibold text-[#06241f] no-underline transition-opacity hover:opacity-85"
                >
                  Book a Workshop
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
                <span className="text-[13px] text-white/40">*With no obligation to proceed</span>
              </div>
            </div>

            {/* ── Robot column (shown on lg+) ── */}
            <div className="relative hidden overflow-hidden lg:block">
              <Image
                src="/3.png"
                alt="Simtec robot"
                width={860}
                height={1451}
                className="pointer-events-none absolute left-[-195px] top-[-78px] h-auto w-[860px] max-w-none"
                style={{ filter: "drop-shadow(0 0 30px rgba(45,212,191,.4))" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
