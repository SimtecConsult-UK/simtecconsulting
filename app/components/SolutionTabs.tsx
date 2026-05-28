"use client";

import { useState, useEffect, useRef } from "react";

const solutions = [
  {
    tab: "Materials & Waste",
    title: "Materials & Waste Management Systems",
    description:
      "Track materials movements, testing, compliance and reporting through a connected operational workflow.",
    features: [
      "Live materials tracking",
      "Testing & compliance workflows",
      "Automated reporting",
      "Carbon tracking",
      "Client dashboards",
      "Audit-ready records",
    ],
    color: "#ff5db3",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="2" y="8" width="16" height="12" rx="2" />
        <path d="M18 11h4l3 4v5h-7V11z" />
        <circle cx="7"  cy="22" r="2" />
        <circle cx="21" cy="22" r="2" />
        <path d="M9 4a4 4 0 0 1 4 4" />
        <path d="M13 4L9 4l1-2" />
      </svg>
    ),
  },
  {
    tab: "Operational Planning",
    title: "Operational Planning Systems",
    description:
      "Manage projects, crews, plant and operational scheduling from a single operational environment.",
    features: [
      "Project planning",
      "Resource allocation",
      "Crew scheduling",
      "Plant & equipment management",
      "Operational visibility dashboards",
      "Workflow approvals",
    ],
    color: "#b04df0",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="3" y="5" width="22" height="20" rx="2" />
        <path d="M3 11h22" />
        <path d="M9 3v4M19 3v4" />
        <rect x="6"  y="15" width="7"  height="2.5" rx="1" fill="currentColor" stroke="none" />
        <rect x="9"  y="20" width="11" height="2.5" rx="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    tab: "Site Operations",
    title: "Site Operations Systems",
    description:
      "Digitise site records, inspections, diaries and reporting workflows in real time.",
    features: [
      "Mobile site diaries",
      "Digital forms",
      "Inspections & sign-offs",
      "Delivery tracking",
      "Issue reporting",
      "Live operational reporting",
    ],
    color: "#4a6cf7",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="7" y="2" width="14" height="24" rx="3" />
        <path d="M11 7h6M11 11h6M11 15h4" />
        <circle cx="14" cy="21" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    tab: "Client Portals",
    title: "Client & Project Portals",
    description:
      "Provide clients and stakeholders with controlled access to operational information, reporting and project documentation.",
    features: [
      "Live project visibility",
      "Secure document access",
      "Compliance reporting",
      "Workflow tracking",
      "Dashboard reporting",
      "External collaboration tools",
    ],
    color: "#00c9a7",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M14 2L3 7v7c0 6 5 10.5 11 13 6-2.5 11-7 11-13V7L14 2z" />
        <circle cx="14" cy="12" r="3" />
        <path d="M8.5 22c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      </svg>
    ),
  },
];

const INTERVAL_MS = 5000;

export function SolutionTabs() {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const s = solutions[active];

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setActive((prev) => (prev + 1) % solutions.length);
      }
    }, INTERVAL_MS);
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTabClick = (i: number) => {
    setActive(i);
    startInterval(); // reset 5 s timer on manual click
  };

  return (
    <div className="mx-auto max-w-[820px]">
      <style>{`
        @keyframes tab-pulse {
          0%, 100% { transform: scale(1);    opacity: 1;   }
          50%       { transform: scale(1.09); opacity: 0.8; }
        }
        .tab-pulsing {
          animation: tab-pulse 1.6s ease-in-out infinite !important;
        }
      `}</style>

      {/* Compact tabs */}
      <div className="mb-4 flex gap-2 justify-center flex-wrap">
        {solutions.map((sol, i) => (
          <button
            key={sol.tab}
            onClick={() => handleTabClick(i)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold ${
              i === active ? "tab-pulsing" : "transition-colors duration-200"
            }`}
            style={
              i === active
                ? { background: sol.color, color: "#fff" }
                : {
                    background: "var(--color-surface-container)",
                    color: "var(--color-on-surface-variant)",
                  }
            }
          >
            {sol.tab}
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >

        {/* Icon */}
        <div
          className="mb-5 inline-flex items-center justify-center rounded-xl p-3"
          style={{ background: `${s.color}18`, color: s.color }}
        >
          {s.icon}
        </div>

        {/* Title */}
        <h3
          className="text-[20px] font-bold leading-snug tracking-[-0.01em] text-on-surface md:text-[22px]"
          style={{ fontFamily: "var(--font-league-spartan)" }}
        >
          {s.title}
        </h3>

        {/* Description */}
        <p className="mt-3 text-[14px] leading-relaxed text-on-surface-variant">
          {s.description}
        </p>

        {/* Features label */}
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant opacity-50">
          Features include:
        </p>

        {/* Feature list */}
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          {s.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-on-surface-variant">
              <span
                className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              {f}
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
