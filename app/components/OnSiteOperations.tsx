"use client";

import { useState, useRef, useEffect } from "react";
import { SECTION_IDS } from "../lib/sections";

const modules = [
  {
    name: "HSEQ Management",
    desc: "Manage RAMS, toolbox talks, permits, incidents, NCRs, audits, inspections, safety briefings and compliance dashboards from one place.",
    vid: "/video1-section1.webm",
  },
  {
    name: "Waste & Materials Tracking",
    desc: "Track waste and material movements, generate Waste Transfer Notes, Hazardous Waste Consignment Notes and maintain clear compliance records.",
    vid: "/video1-section1.webm",
  },
  {
    name: "Environmental & Carbon Reporting",
    desc: "Capture data around material reuse, transport, emissions and environmental impact. Turn operational activity into useful reporting for clients, regulators or internal ESG requirements.",
    vid: "/video1-section1.webm",
  },
];

export function OnSiteOperations() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  return (
    <section
      id={SECTION_IDS.productDemo}
      style={{ background: "#e8eaf4" }}
      className="px-6 py-10 md:px-10 md:py-14 xl:px-20 xl:py-20"
    >
      {/* Section heading */}
      <h2
        className="font-heading mx-auto mb-10 max-w-[1760px] text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[#13151e] sm:text-[36px] md:mb-12 lg:text-[44px] xl:text-[52px] 2xl:text-[64px]"
      >
        Build safety, compliance and environmental control directly into everyday workflows.
      </h2>

      {/* Panel */}
      <div
        className="mx-auto w-full max-w-[1760px] overflow-hidden rounded-[28px] bg-white"
        style={{
          boxShadow:
            "0 24px 64px -32px rgba(20,26,50,.28), 0 2px 8px rgba(20,26,50,.06)",
        }}
      >
        {/* Two-column grid — left col scales from 400→560px across lg→2xl */}
        <div className="grid grid-cols-1 lg:grid-cols-[clamp(400px,30vw,560px)_1fr]">

          {/* ── Left: heading + interactive list ── */}
          <div className="border-b border-[#e8eaef] px-8 py-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-14 lg:pl-16 2xl:px-[88px] 2xl:py-[88px] 2xl:pl-[104px]">
            <h2
              className="font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.022em] text-[#13151e] sm:text-[34px] 2xl:text-[52px] 2xl:tracking-[-0.026em]"
            >
              Compliance, HSEQ &amp;<br />Environmental Tracking
            </h2>

            <div className="mt-9 2xl:mt-[52px]">
              {modules.map((m, i) => {
                const on = i === active;
                return (
                  <button
                    key={m.name}
                    onClick={() => setActive(i)}
                    className="w-full cursor-pointer border-t border-[#e8eaef] py-[18px] text-left first:border-t-0 2xl:py-[26px]"
                  >
                    <div className="flex items-start gap-[14px] 2xl:gap-4">
                      <span
                        className="mt-[6px] h-3 w-3 shrink-0 rounded-full transition-colors duration-200 2xl:mt-2 2xl:h-3.5 2xl:w-3.5"
                        style={{ background: on ? "#2d5fc4" : "#d0d4de" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[17px] font-semibold leading-[1.22] tracking-[-0.01em] text-[#13151e] 2xl:text-[24px]"
                        >
                          {m.name}
                        </p>
                        <div
                          className={`mt-2.5 max-w-[340px] text-[14px] leading-[1.6] text-[#6b7280] transition-opacity duration-200 2xl:mt-[13px] 2xl:max-w-[480px] 2xl:text-[17px] ${
                            on ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {m.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: video frame ── */}
          <div className="flex items-center bg-[#f4f5f9] p-8 lg:p-10 2xl:p-16">
            <div
              className="w-full overflow-hidden rounded-[14px]"
              style={{
                aspectRatio: "16 / 9",
                background: "#0c0e14",
                boxShadow:
                  "0 28px 64px -28px rgba(20,26,50,.48), 0 4px 16px -6px rgba(20,26,50,.18)",
              }}
            >
              {modules.map((m, i) => (
                <video
                  key={m.name}
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={m.vid}
                  muted
                  loop
                  playsInline
                  style={{
                    display: i === active ? "block" : "none",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top left",
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
