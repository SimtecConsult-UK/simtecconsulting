"use client";

import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ibmPlexSans } from "../lib/fonts";
import { useTabVideoPlayer } from "../hooks/useTabVideoPlayer";

// Scoped to this section only — the rest of the site uses League Spartan /
// JetBrains Mono / Inter (see app/layout.tsx), so these load here rather than
// in the root layout. IBM Plex Sans is shared with app/discovery via
// ../lib/fonts to avoid loading the same family twice.
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], display: "swap" });

const modules = [
  {
    number: "01 / PROJECTS",
    tabLabel: "Project & Job Management",
    description:
      "Create, manage and track projects, jobs and tasks from start to finish. Assign responsibility, update statuses, add notes, upload documents and keep a clear record of what has happened.",
    vid: "/video1-section1.webm",
  },
  {
    number: "02 / PLANNING",
    tabLabel: "Planning & Scheduling",
    description:
      "Plan people, teams, plant and equipment using calendar or Gantt-style views. See what is booked, what is available, and where clashes or gaps exist before they become a problem.",
    vid: "/video1-section1.webm",
  },
];

export function MoreModules() {
  const { active, setActive, videoRefs } = useTabVideoPlayer();

  return (
    <section className="p-[24px] sm:p-[32px] lg:p-[40px] 2xl:p-[80px]" style={{ background: "var(--color-tinted-bg)" }}>
      {/* Panel */}
      <div
        className="mx-auto w-full max-w-[1760px] overflow-hidden rounded-[28px] p-[24px] sm:p-[32px] md:p-[48px] lg:p-[64px] 2xl:p-[96px]"
        style={{
          background: "#1a1530",
          boxShadow: "0 24px 64px -32px rgba(20,26,50,.38), 0 2px 8px rgba(20,26,50,.08)",
        }}
      >
        {/* Header */}
        <div className="mb-[24px] lg:mb-[36px] 2xl:mx-auto 2xl:mb-[52px] 2xl:max-w-[1360px]">
          <div
            className={`${plexMono.className} text-[11px] font-semibold uppercase tracking-[.18em]`}
            style={{ color: "#8f8bd9" }}
          >
            More Modules
          </div>
          <h2
            className={`${grotesk.className} mt-[10px] text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[30px] lg:mt-[13px] lg:text-[34px] lg:leading-[1.1] lg:tracking-[-0.022em] 2xl:mt-[18px] 2xl:text-[52px] 2xl:leading-[1.07] 2xl:tracking-[-0.026em]`}
          >
            Run the day-to-day,<br />not just the paperwork
          </h2>
        </div>

        {/* Video demo frame */}
        <div
          className="w-full overflow-hidden rounded-[16px] 2xl:mx-auto 2xl:max-w-[1360px]"
          style={{
            aspectRatio: "16 / 9",
            background: "#0c0e14",
            boxShadow: "0 28px 64px -28px rgba(0,0,0,.6)",
          }}
        >
          {modules.map((m, i) => (
            <video
              key={m.tabLabel}
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

        {/* Footer row */}
        <div className="mt-[20px] flex flex-col gap-[20px] lg:mt-[28px] 900:flex-row 900:items-start 900:justify-between 900:gap-[40px] 2xl:mx-auto 2xl:mt-[40px] 2xl:max-w-[1360px]">
          {/* Left group: number + description */}
          <div className="flex flex-col gap-[8px] 900:flex-row 900:items-start 900:gap-[40px]">
            <div
              className={`${plexMono.className} shrink-0 text-[13px] font-medium tracking-[.12em] 900:mt-[3px] 2xl:mt-[4px] 2xl:text-[14px]`}
              style={{ color: "#6f68b8" }}
            >
              {modules[active].number}
            </div>
            <div
              className={`${ibmPlexSans.className} max-w-[560px] text-[14px] leading-[1.65] 2xl:max-w-[700px] 2xl:text-[17px]`}
              style={{ color: "rgba(255,255,255,.62)" }}
            >
              {modules[active].description}
            </div>
          </div>

          {/* Right: segmented tab switcher */}
          <div
            className="flex w-full gap-[8px] self-start rounded-full p-[5px] 900:w-auto 900:flex-none 2xl:p-[6px]"
            style={{ background: "rgba(255,255,255,.06)" }}
          >
            {modules.map((m, i) => {
              const on = i === active;
              return (
                <button
                  key={m.tabLabel}
                  onClick={() => setActive(i)}
                  className={`${grotesk.className} flex-1 cursor-pointer rounded-full px-[16px] py-[10px] text-center text-[13px] font-semibold tracking-[.01em] transition-all duration-200 900:flex-none 900:whitespace-nowrap 900:px-[20px] 2xl:px-[26px] 2xl:py-[13px] 2xl:text-[15px]`}
                  style={{
                    background: on ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)" : "transparent",
                    color: on ? "#fff" : "rgba(255,255,255,.55)",
                  }}
                >
                  {m.tabLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
