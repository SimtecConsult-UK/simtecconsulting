"use client";

import { useEffect, useRef } from "react";

export function ProductMock() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Phase 1 — tilt up as element enters viewport
      const inStart = vh;
      const inEnd = vh * 0.2;
      const inProgress = Math.min(Math.max((inStart - rect.top) / (inStart - inEnd), 0), 1);
      const rotateX = 40 * (1 - inProgress);
      const inOpacity = Math.min(inProgress * 1.5, 1);

      // Phase 2 — blur + fade out as element exits through the top
      // Starts when rect.top < 0, completes when 60% of height has scrolled past
      const exitProgress = Math.min(Math.max(-rect.top / (rect.height * 0.6), 0), 1);
      const blur = exitProgress * 24;
      const outOpacity = 1 - exitProgress;

      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg)`;
      el.style.opacity = String(inOpacity * outOpacity);
      el.style.filter = blur > 0 ? `blur(${blur}px)` : "";
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-6xl"
      style={{
        transform: "perspective(1200px) rotateX(40deg)",
        opacity: 0,
        transformOrigin: "bottom center",
        willChange: "transform, opacity",
      }}
    >
      {/* Soft gradient halo behind the device */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 mx-auto h-[78%] w-[78%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, #b8c3ff 0%, #b8c3ff 30%, transparent 70%)",
        }}
      />

      {/* Browser / desktop frame */}
      <div className="relative mx-auto w-[88%] overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_30px_80px_-20px_rgba(14,20,30,0.35)]">
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #ff5db3 0%, #b04df0 50%, #4a6cf7 100%)",
          }}
        />
        <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
            <span className="h-3 w-3 rounded-full bg-[#ffd166]" />
            <span className="h-3 w-3 rounded-full bg-[#5cd482]" />
          </div>
          <div className="mx-auto flex w-2/3 max-w-md items-center justify-center rounded-md bg-surface-container px-3 py-1 text-[11px] text-on-surface-variant">
            simtec.build/projects
          </div>
        </div>

        <div className="grid grid-cols-[160px_1fr_180px] gap-0 min-h-[480px]">
          {/* Sidebar */}
          <aside className="border-r border-outline-variant bg-surface-container-low p-3 text-[11px] text-on-surface-variant">
            <div className="mb-3 flex items-center gap-2 font-semibold text-on-surface">
              <span className="inline-block h-4 w-4 rounded-sm bg-brand-blue" />
              Simtec Build
            </div>
            <ul className="space-y-1.5">
              {[
                "Dashboard",
                "Crews",
                "Projects",
                "Daily Logs",
                "RFIs",
                "Submittals",
                "Punch List",
                "Photos",
                "Reports",
              ].map((item, idx) => (
                <li
                  key={item}
                  className={`rounded-md px-2 py-1 ${
                    idx === 2 ? "bg-primary/10 font-semibold text-primary" : ""
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main content */}
          <main className="p-4 text-[11px]">
            <div className="mb-3 flex items-center gap-2 text-on-surface-variant">
              <span>Projects</span>
              <span>/</span>
              <span>NB-1042</span>
            </div>
            <div className="rounded-lg border border-outline-variant p-3">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-7h6v7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold text-on-surface">
                    Daily Field Report
                  </div>
                  <div className="text-on-surface-variant">Crew Alpha</div>
                </div>
              </div>

              {[
                { title: "Foundation Pour", state: "Submitted" },
                { title: "Site Safety Inspection", state: "Awaiting Review" },
                { title: "Material Delivery", state: "Logged" },
              ].map((row) => (
                <div
                  key={row.title}
                  className="flex items-center justify-between border-t border-outline-variant py-2"
                >
                  <div className="font-semibold text-on-surface">
                    {row.title}
                  </div>
                  <div className="text-on-surface-variant">{row.state}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-outline-variant p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Schedule
                </div>
                <div className="mt-1 font-semibold text-on-surface">
                  92% on track
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-outline-variant p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Budget
                </div>
                <div className="mt-1 font-semibold text-on-surface">
                  $4.2M / $5.1M
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent-coral)]"
                    style={{ width: "82%" }}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Right rail */}
          <aside className="border-l border-outline-variant bg-surface-container-low p-3 text-[11px]">
            <div className="font-semibold text-on-surface">Project Details</div>
            <div className="mt-2 space-y-2 text-on-surface-variant">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  In Progress
                </span>
              </div>
              <div className="flex justify-between">
                <span>Foreman</span>
                <span>J. Rivera</span>
              </div>
              <div className="flex justify-between">
                <span>Site</span>
                <span>Bay 4</span>
              </div>
              <div className="flex justify-between">
                <span>Start</span>
                <span>Mar 06, 2026</span>
              </div>
            </div>
            <div className="mt-4 font-semibold text-on-surface">Crew</div>
            <ul className="mt-2 space-y-1 text-on-surface-variant">
              <li>· 12 site members</li>
              <li>· 3 subcontractors</li>
              <li>· 1 safety officer</li>
            </ul>
          </aside>
        </div>
      </div>

      {/* Phone overlay */}
      <div className="absolute -right-2 bottom-0 hidden w-[150px] -rotate-[2deg] overflow-hidden rounded-[26px] border border-outline-variant bg-white shadow-[0_30px_60px_-15px_rgba(14,20,30,0.35)] sm:right-4 sm:block md:right-8 md:w-[180px]">
        <div className="flex items-center justify-between bg-white px-4 pt-2 text-[9px] font-semibold text-on-surface">
          <span>9:41</span>
          <span className="flex gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-on-surface" />
            <span className="inline-block h-2 w-3 rounded-sm bg-on-surface" />
          </span>
        </div>
        <div className="p-3 text-[10px]">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>&lt;</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-semibold text-primary">
              Required
            </span>
          </div>
          <div className="mt-2 text-[13px] font-bold text-on-surface">
            Daily Log
          </div>

          {["Site Safety Check", "Material Counts", "Weather"].map((item) => (
            <div key={item} className="mt-3">
              <div className="text-[10px] font-semibold text-on-surface">
                {item}
              </div>
              <div className="mt-1 rounded-md border border-outline-variant p-2">
                <div className="text-[9px] font-semibold text-primary">
                  + Add entry
                </div>
              </div>
            </div>
          ))}

          <div className="mt-3 rounded-md bg-surface-container px-2 py-2 text-center text-[10px] font-semibold text-on-surface-variant">
            Submit Report
          </div>
        </div>
      </div>
    </div>
  );
}
