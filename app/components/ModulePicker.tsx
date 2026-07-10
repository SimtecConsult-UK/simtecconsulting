"use client";

import { useState } from "react";
import { ROUTES, SECTION_IDS } from "../lib/sections";
import { MODULE_CATALOG } from "../lib/moduleCatalog";

// Accent matches the nav "Book a Workshop" CTA (brand teal + dark ink text on fills)
const ACCENT = "var(--color-brand-blue)";
const ON_ACCENT = "#0c2421";
const ACCENT_TINT = "rgba(110, 234, 218, 0.18)";

const TYPES = [
  "Waste & Skip Hire",
  "Civil Engineering",
  "Main Contractor",
  "Remediation & Earthworks",
  "Environmental Consultant",
  "Geotechnical & Drilling",
  "Specialist Subcontractor",
  "Aggregates & Haulage",
  "Housebuilder",
  "Internal Operations",
];

// Names/descriptions are shared with the discovery form via ../lib/moduleCatalog.
// `color` (tag styling) is this picker's own concern, not part of the shared
// catalog — assigned by category position, which is stable regardless of
// header wording. Module `id`s come straight from the shared catalog (a
// permanent identifier per module — see moduleCatalog.ts), so RECOMMENDED
// below stays correct even if modules are reordered, renamed, or inserted.
const CATEGORY_COLORS = ["#0B0A0C", "#6EEADA", "#6387D9", "#7B2BD8", "#E46897"];

const CATEGORIES = MODULE_CATALOG.map((category, i) => ({
  name: category.header,
  color: CATEGORY_COLORS[i],
  modules: category.modules.map((m) => ({ id: m.id, name: m.name, desc: m.description })),
}));

const RECOMMENDED: string[][] = [
  ["dispatch-logistics", "plant-equipment-asset-tracking", "mobile-operative-driver-workflows", "waste-materials-tracking", "field-to-invoice-workflows", "client-portals", "system-integrations"],
  ["project-job-management", "planning-scheduling", "site-diaries-field-reporting", "hseq-management", "plant-equipment-asset-tracking", "quotes-pos-applications-for-payment", "client-portals"],
  ["project-job-management", "planning-scheduling", "hseq-management", "quotes-pos-applications-for-payment", "client-portals", "automated-forms-pdfs-notifications"],
  ["site-diaries-field-reporting", "plant-equipment-asset-tracking", "hseq-management", "waste-materials-tracking", "environmental-carbon-reporting", "client-portals"],
  ["project-job-management", "site-diaries-field-reporting", "hseq-management", "client-portals", "automated-forms-pdfs-notifications"],
  ["project-job-management", "planning-scheduling", "site-diaries-field-reporting", "plant-equipment-asset-tracking", "maintenance-servicing-records", "client-portals"],
  ["project-job-management", "planning-scheduling", "site-diaries-field-reporting", "hseq-management", "timesheets-labour-capture", "client-portals"],
  ["dispatch-logistics", "plant-equipment-asset-tracking", "mobile-operative-driver-workflows", "waste-materials-tracking", "quotes-pos-applications-for-payment", "client-portals", "system-integrations"],
  ["project-job-management", "planning-scheduling", "hseq-management", "client-portals", "automated-forms-pdfs-notifications"],
  ["project-job-management", "quotes-pos-applications-for-payment", "automated-forms-pdfs-notifications", "timesheets-labour-capture", "training-certification-management", "system-integrations"],
];

// Built once at module load — O(1) id → {name, color} lookup for the summary panel.
const MODULE_INDEX = new Map(
  CATEGORIES.flatMap((cat) => cat.modules.map((m) => [m.id, { name: m.name, color: cat.color }])),
);

export function ModulePicker() {
  const [activeType, setActiveType] = useState(1);
  const [picks, setPicks] = useState<Record<number, string[]>>({});

  function toggle(id: string) {
    setPicks((prev) => {
      const cur = prev[activeType] ?? RECOMMENDED[activeType];
      return {
        ...prev,
        [activeType]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
      };
    });
  }

  const currentPicks = picks[activeType] ?? RECOMMENDED[activeType];

  return (
    <section id={SECTION_IDS.solutions} className="bg-white px-5 py-8 md:px-10 md:py-11 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-[1200px]">

        {/* Eyebrow — teal pill (matches nav CTA); bright teal as flat text on white is illegible */}
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ background: ACCENT, color: ON_ACCENT }}
        >
          Modular platform
        </span>

        {/* Heading */}
        <h2 className="font-heading mt-4 max-w-full text-[28px] font-bold leading-[1.05] tracking-[-0.022em] text-[#16202e] md:text-[36px] lg:max-w-[720px] lg:text-[46px]">
          Build your system, module by module.
        </h2>

        {/* Subtext */}
        <p className="mt-5 max-w-full text-[14.5px] leading-[1.6] text-[#5a6573] md:text-[16px] lg:max-w-[600px] lg:text-[17px]">
          We&apos;ve built every module a construction business runs on — but you don&apos;t sign for all of them. Tell us how you work, pick what fits, and we assemble your platform from the parts you choose.
        </p>

        {/* You are — type chips */}
        <div className="mt-[30px] lg:mt-[42px]">
          <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#97a0ab]">
            You are
          </p>
          <div className="flex flex-wrap gap-[9px]">
            {TYPES.map((label, i) => {
              const active = i === activeType;
              return (
                <button
                  key={label}
                  onClick={() => setActiveType(i)}
                  className="font-heading cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-[13px] py-2 text-[12.5px] transition-all duration-150 md:px-4 md:py-[9px] md:text-[13.5px]"
                  style={{
                    borderColor: active ? ACCENT : "#e3e7ec",
                    background: active ? ACCENT : "#fff",
                    color: active ? ON_ACCENT : "#3a4654",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Your modules */}
        <div className="mt-[26px] lg:mt-9">
          <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#97a0ab]">
            Your modules
          </p>
          <p className="mb-5 text-[13px] leading-[1.5] text-[#97a0ab]">
            We&apos;ve pre-selected the modules most {TYPES[activeType]} teams start with. All 20 are here — tick on or off to shape your platform.
          </p>

          <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_280px] md:items-start md:gap-9 lg:grid-cols-[1fr_360px]">

            {/* Module categories */}
            <div className="flex flex-col gap-6">
              {CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                      style={{ background: cat.color }}
                    />
                    <span className="font-heading text-[12px] font-semibold text-[#3a4654]">
                      {cat.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {cat.modules.map((m) => {
                      const sel = currentPicks.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggle(m.id)}
                          className="block w-full cursor-pointer rounded-[11px] border-[1.5px] p-[13px] text-left transition-all duration-150 lg:p-[17px]"
                          style={{
                            borderColor: sel ? ACCENT : "#e3e7ec",
                            background: sel ? ACCENT_TINT : "#fff",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-all duration-150"
                              style={{
                                borderColor: sel ? ACCENT : "#cdd4dd",
                                background: sel ? ACCENT : "#fff",
                              }}
                            >
                              {sel && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path
                                    d="M1 4L3.8 7L9 1"
                                    stroke={ON_ACCENT}
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <div className="flex-1">
                              <p className="font-heading text-[13.5px] font-semibold text-[#16202e] lg:text-[15px]">
                                {m.name}
                              </p>
                              <p className="mt-1 text-[12px] leading-[1.45] text-[#5a6573] lg:text-[13px]">
                                {m.desc}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary panel — sticky on tablet & desktop, static (stacked) on mobile */}
            <div className="rounded-[14px] border border-[#e3e7ec] bg-[#f7f8fa] p-[22px] md:sticky md:top-[calc(var(--nav-height)+16px)] lg:p-[26px]">
              <div className="flex items-center justify-between">
                <p className="font-heading text-[16px] font-semibold text-[#16202e]">Your build</p>
                <span className="rounded-full border border-[#e3e7ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#16202e]">
                  {currentPicks.length} / 20
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-[#5a6573]">
                Modules for {TYPES[activeType]}
              </p>
              <div className="my-[18px] h-px bg-[#e3e7ec]" />

              {currentPicks.length > 0 ? (
                <div className="flex flex-col gap-[9px]">
                  {currentPicks.map((id) => {
                    const m = MODULE_INDEX.get(id);
                    return (
                      <div key={id} className="flex items-center gap-2.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
                          style={{ background: m?.color }}
                        />
                        <span className="text-[13.5px] font-medium text-[#16202e]">{m?.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13.5px] leading-[1.5] text-[#97a0ab]">
                  No modules selected yet. Tick the ones you need and they&apos;ll appear here.
                </p>
              )}

              <div className="my-[18px] h-px bg-[#e3e7ec]" />
              <p className="mb-4 text-[12.5px] leading-[1.55] text-[#5a6573]">
                Every module runs on one shared core. Start with a few — switch more on whenever you&apos;re ready.
              </p>
              <a
                href={ROUTES.discovery}
                className="font-heading block w-full cursor-pointer rounded-[9px] bg-[var(--color-brand-blue)] py-[12px] text-center text-[14px] font-semibold transition-colors hover:bg-[#85f0e4] lg:py-[13px]"
                style={{ color: ON_ACCENT }}
              >
                Book a Workshop →
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
