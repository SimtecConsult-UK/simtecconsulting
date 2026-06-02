"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CASE_STUDIES = [
  {
    client: "Collins Earthworks",
    project: "Streamlining Compliance & Carbon Reporting",
    description:
      "Collins Earthworks needed a digital system to bring structure and consistency to testing workflows and carbon tracking. Manual processes were time-consuming, difficult to audit and increasingly risky from both a compliance and operational perspective.",
    deliverables: [
      "Digital testing workflows",
      "CAD integration",
      "Carbon analytics platform",
      "Automated reporting",
      "Dashboards & operational visibility",
      "Audit-ready reporting",
    ],
    impact: [
      "Faster, more consistent reporting",
      "Improved compliance visibility",
      "Reduced manual administration",
      "Better operational transparency",
      "Used as a work-winning differentiator",
    ],
  },
  {
    client: "Geotechnical Engineering Ltd",
    project: "Eliminating Site Admin Overtime Through Real-Time Reporting",
    description:
      "Geotechnical Engineering Ltd needed to reduce operational admin burden and eliminate excessive overtime caused by manual reporting processes.",
    deliverables: [
      "Mobile site diary application",
      "Real-time reporting workflows",
      "SharePoint integration",
      "Site tracking tools",
      "Delivery & issue logging",
    ],
    impact: [
      "~10% time saving across the business",
      "Overtime admin virtually eliminated",
      "Improved management visibility",
      "Faster operational reporting",
      "Reduced manual administration",
    ],
  },
  {
    client: "Vertase FLI",
    project: "Standardising Materials Management Across Complex Projects",
    description:
      "Vertase FLI required a more structured and scalable approach to materials management, compliance reporting and operational visibility across projects.",
    deliverables: [
      "Centralised materials management system",
      "Live materials tracking",
      "Automated testing imports",
      "Compliance dashboards",
      "Reporting automation",
      "Carbon tracking capability",
    ],
    impact: [
      "Reduced administrative workload",
      "Improved auditability and compliance",
      "Better project consistency",
      "Reduced dependency on manual processes",
      "Stronger competitive positioning",
    ],
  },
];

type Pos = { x: number; y: number };

export function ImageBand() {
  const [studyIdx, setStudyIdx] = useState(0);
  const [dragPos, setDragPos] = useState<Pos | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const study = CASE_STUDIES[studyIdx];
  const total = CASE_STUDIES.length;
  const goTo = (i: number) => setStudyIdx((i + total) % total);

  useEffect(() => {
    if (isDragging) {
      document.body.classList.add("is-dragging");
    } else {
      document.body.classList.remove("is-dragging");
    }
    return () => { document.body.classList.remove("is-dragging"); };
  }, [isDragging]);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const win = windowRef.current;
    const section = sectionRef.current;
    if (!win || !section) return;
    let startX: number, startY: number;
    if (dragPos === null) {
      const sRect = section.getBoundingClientRect();
      const wRect = win.getBoundingClientRect();
      startX = wRect.left - sRect.left;
      startY = wRect.top - sRect.top;
      setDragPos({ x: startX, y: startY });
    } else {
      startX = dragPos.x;
      startY = dragPos.y;
    }
    dragOrigin.current = { mouseX: e.clientX, mouseY: e.clientY, posX: startX, posY: startY };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragOrigin.current.mouseX;
      const dy = e.clientY - dragOrigin.current.mouseY;
      const section = sectionRef.current;
      const win = windowRef.current;
      if (!section || !win) return;
      setDragPos({
        x: Math.max(0, Math.min(section.offsetWidth - win.offsetWidth, dragOrigin.current.posX + dx)),
        y: Math.max(0, Math.min(section.offsetHeight - win.offsetHeight, dragOrigin.current.posY + dy)),
      });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const windowStyle: React.CSSProperties =
    dragPos !== null
      ? { position: "absolute", left: dragPos.x, top: dragPos.y }
      : { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <section
      ref={sectionRef as React.Ref<HTMLElement>}
      className="relative h-screen overflow-hidden"
    >
      {/* Background */}
      <Image
        src="/image-section.jpg"
        alt="Construction site"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.60)" }} />

      {/* macOS glass window */}
      <div
        ref={windowRef}
        style={{
          ...windowStyle,
          width: "min(700px, calc(100vw - 48px))",
          zIndex: 10,
          borderRadius: 14,
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
          overflow: "hidden",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(8,8,16,0.60)",
        }}
      >
        {/* Title bar */}
        <div
          onMouseDown={handleTitleMouseDown}
          className="terminal-title-bar"
          style={{
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            userSelect: "none",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {(["#FF5F57", "#FEBC2E", "#28C840"] as const).map((c, i) => (
              <span
                key={i}
                style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block", opacity: 0.9 }}
              />
            ))}
          </div>

          {/* Title */}
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: "0.08em", fontWeight: 500 }}>
            Case Studies
          </span>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} onMouseDown={(e) => e.stopPropagation()}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
              {studyIdx + 1}/{total}
            </span>
            {(["‹", "›"] as const).map((arrow, i) => (
              <button
                key={arrow}
                onClick={() => goTo(studyIdx + (i === 0 ? -1 : 1))}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 16,
                  lineHeight: 1,
                  width: 26,
                  height: 22,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                {arrow}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Client + project */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>
              Client
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.2, marginBottom: 4 }}>
              {study.client}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
              {study.project}
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />

          {/* Description */}
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.62)", marginBottom: 24, margin: "0 0 24px" }}>
            {study.description}
          </p>

          {/* Two-column: deliverables + impact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
                What We Delivered
              </div>
              {study.deliverables.map((d) => (
                <div key={d} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: "rgba(99,179,237,0.8)", fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{d}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
                Business Impact
              </div>
              {study.impact.map((d) => (
                <div key={d} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: "rgba(72,199,142,0.85)", fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
