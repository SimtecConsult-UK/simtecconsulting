"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CASE_STUDIES = [
  {
    client: "Collins Earthworks",
    project: "Streamlining Compliance & Carbon Reporting",
    description:
      "Collins Earthworks needed a digital system to bring structure and consistency to testing workflows and carbon tracking. Manual processes were time-consuming, difficult to audit and increasingly risky from both a compliance and operational perspective.",
    delivered: [
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
    delivered: [
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
    delivered: [
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

// Default position offsets relative to center, per window index
const WINDOW_TRANSFORMS = [
  "translate(-50%, -50%)",                                 // 0: center (front)
  "translate(calc(-50% - 250px), calc(-50% + 50px))",     // 1: left, 50px lower
  "translate(calc(-50% + 250px), calc(-50% - 75px))",     // 2: right, 75px higher
];

export function ImageBand() {
  // stackOrder: indices from back (0) to front (last)
  const [stackOrder, setStackOrder] = useState([1, 2, 0]); // window 0 starts in front
  const [dragPositions, setDragPositions] = useState<(Pos | null)[]>([null, null, null]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const dragOrigin = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, winIdx: 0 });
  const windowRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const sectionRef = useRef<HTMLElement>(null);

  const getZIndex = (idx: number) => stackOrder.indexOf(idx) + 1;
  const isFront = (idx: number) => stackOrder[stackOrder.length - 1] === idx;

  const bringToFront = (idx: number) => {
    setStackOrder((prev) => [...prev.filter((x) => x !== idx), idx]);
  };

  const resetPosition = (idx: number) => {
    setDragPositions((prev) => {
      const next = [...prev] as (Pos | null)[];
      next[idx] = null;
      return next;
    });
  };

  const handleTitleMouseDown = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    bringToFront(idx);

    const win = windowRefs.current[idx];
    const section = sectionRef.current;
    if (!win || !section) return;

    let startX: number, startY: number;
    const cur = dragPositions[idx];
    if (cur === null) {
      const sRect = section.getBoundingClientRect();
      const wRect = win.getBoundingClientRect();
      startX = wRect.left - sRect.left;
      startY = wRect.top - sRect.top;
      setDragPositions((prev) => {
        const next = [...prev] as (Pos | null)[];
        next[idx] = { x: startX, y: startY };
        return next;
      });
    } else {
      startX = cur.x;
      startY = cur.y;
    }

    dragOrigin.current = { mouseX: e.clientX, mouseY: e.clientY, posX: startX, posY: startY, winIdx: idx };
    setDraggingIdx(idx);
  };

  useEffect(() => {
    if (draggingIdx === null) return;
    const onMove = (e: MouseEvent) => {
      const { mouseX, mouseY, posX, posY, winIdx } = dragOrigin.current;
      // Guard: discard if dragOrigin was already updated for a newer drag
      if (winIdx !== draggingIdx) return;
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;
      const section = sectionRef.current;
      const win = windowRefs.current[winIdx];
      if (!section || !win) return;
      const maxX = section.offsetWidth - win.offsetWidth;
      const maxY = section.offsetHeight - win.offsetHeight;
      setDragPositions((prev) => {
        const next = [...prev] as (Pos | null)[];
        next[winIdx] = {
          x: Math.max(0, Math.min(maxX, posX + dx)),
          y: Math.max(0, Math.min(maxY, posY + dy)),
        };
        return next;
      });
    };
    const onUp = () => setDraggingIdx(null);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [draggingIdx]);

  useEffect(() => {
    document.body.classList.toggle("is-dragging", draggingIdx !== null);
    return () => document.body.classList.remove("is-dragging");
  }, [draggingIdx]);

  const getWindowStyle = (idx: number): React.CSSProperties => {
    const pos = dragPositions[idx];
    const z = getZIndex(idx);
    const front = isFront(idx);
    const base: React.CSSProperties = {
      zIndex: z,
      width: "min(620px, calc(100vw - 64px))",
      opacity: front ? 1 : 0.82,
      transition: draggingIdx === idx ? "none" : "opacity 0.2s",
    };
    if (pos !== null) {
      return { ...base, position: "absolute", left: pos.x, top: pos.y };
    }
    return {
      ...base,
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: WINDOW_TRANSFORMS[idx],
    };
  };

  return (
    <section
      ref={sectionRef as React.Ref<HTMLElement>}
      className="relative h-screen overflow-hidden"
    >
      <Image
        src="/image-section.jpg"
        alt="Construction site"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />

      {CASE_STUDIES.map((study, idx) => (
        <div
          key={idx}
          ref={(el) => { windowRefs.current[idx] = el; }}
          style={getWindowStyle(idx)}
          onClick={() => { if (!isFront(idx)) bringToFront(idx); }}
        >
          {/* Title bar — drag on mousedown, double-click resets to default position */}
          <div
            onMouseDown={(e) => handleTitleMouseDown(e, idx)}
            onDoubleClick={() => resetPosition(idx)}
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px 12px 0 0",
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              userSelect: "none",
              cursor: "grab",
              position: "relative",
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {(["#ff5f57", "#febc2e", "#28c840"] as const).map((color, i) => (
                <span
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                    opacity: isFront(idx) ? 1 : 0.3,
                  }}
                />
              ))}
            </div>

            {/* Centered title */}
            <span
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {study.client}
            </span>
          </div>

          {/* Window body */}
          <div
            style={{
              background: "rgba(8,10,26,0.45)",
              backdropFilter: "blur(28px) saturate(1.5)",
              WebkitBackdropFilter: "blur(28px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              padding: "22px 26px 26px",
              height: 460,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.15) transparent",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Case Study
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "#fff",
                  margin: 0,
                  fontFamily: "var(--font-league-spartan)",
                }}
              >
                {study.project}
              </h3>
            </div>

            <div
              style={{
                width: "100%",
                height: 1,
                background: "rgba(255,255,255,0.07)",
                margin: "14px 0",
              }}
            />

            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 18,
              }}
            >
              {study.description}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>
              {/* Delivered */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    marginBottom: 9,
                  }}
                >
                  What Simtec Delivered
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {study.delivered.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 7,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.68)",
                      }}
                    >
                      <span style={{ color: "#6eeada", flexShrink: 0, marginTop: 2, fontSize: 9 }}>✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Impact */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    marginBottom: 9,
                  }}
                >
                  Business Impact
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {study.impact.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 7,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.68)",
                      }}
                    >
                      <span style={{ color: "#3dd68c", flexShrink: 0, marginTop: 2, fontSize: 11, fontWeight: 700 }}>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
