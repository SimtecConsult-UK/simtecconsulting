"use client";

import { useState } from "react";

const tabs = [
  {
    label: "Site & Field operations",
    description:
      "Site diaries, daily records, inspections, photos, labour, plant, issues, progress and mobile workflows.",
  },
  {
    label: "Materials, Waste & Environmental Data",
    description:
      "Waste tracking, soil movements, testing, permits, transfer notes, diversion, emissions and environmental reporting.",
  },
  {
    label: "Compliance and H&S",
    description:
      "RAMS, audits, actions, incidents, permits, document control, sign-offs and compliance evidence.",
  },
];

export function OnSiteOperations() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="solutions"
      className="px-4 py-24 md:px-16 md:py-32"
      style={{ background: "var(--color-surface-container-low)" }}
    >
      <div className="mx-auto max-w-[1090px]">

        {/* Section heading — outside the card */}
        <h2
          className="font-heading mb-12 text-[36px] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--color-on-surface)] sm:text-[48px] md:mb-14 md:text-[60px]"
        >
          Run every job with clarity
        </h2>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-[var(--color-outline-variant)] bg-white shadow-[0_4px_48px_rgba(0,0,0,0.07),0_1px_8px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr]">

            {/* Left — label + h3 + tabs */}
            <div className="border-b border-[var(--color-outline-variant)] p-8 lg:border-b-0 lg:border-r lg:p-12">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-surface-variant)]">
                On-site operations
              </p>
              <h3
                className="font-heading mb-10 text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-[var(--color-on-surface)] md:text-[28px]"
              >
                Turn execution data into better decisions
              </h3>

              {/* Vertical tabs */}
              <div>
                {tabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActive(i)}
                    className="group w-full border-t border-[var(--color-outline-variant)] py-4 text-left first:border-t-0"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
                          i === active
                            ? "scale-[1.4] bg-[var(--color-primary)]"
                            : "bg-[var(--color-outline-variant)] group-hover:bg-[var(--color-outline)]"
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-[14px] font-semibold leading-snug transition-colors duration-200 ${
                            i === active
                              ? "text-[var(--color-on-surface)]"
                              : "text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)]"
                          }`}
                        >
                          {tab.label}
                        </p>
                        <div
                          className={`overflow-hidden text-[13px] leading-relaxed text-[var(--color-on-surface-variant)] transition-all duration-300 ${
                            i === active ? "mt-1.5 max-h-24 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right — video fills the column */}
            <div
              className="relative overflow-hidden"
              style={{ background: "var(--color-surface-container-low)" }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top", display: "block", clipPath: "inset(4px 0 0 0)" }}
              >
                <source src="/video1-section1.webm" type="video/webm" />
              </video>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
