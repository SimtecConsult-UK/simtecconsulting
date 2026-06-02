"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CASE_STUDIES = [
  `> LOADING SIMTEC CASE STUDY DATABASE...

CLIENT:  Collins Earthworks
PROJECT: Streamlining Compliance
         & Carbon Reporting
──────────────────────────────────────────

Collins Earthworks needed a digital system
to bring structure and consistency to testing
workflows and carbon tracking. Manual processes
were time-consuming, difficult to audit and
increasingly risky from both a compliance and
operational perspective.

WHAT SIMTEC DELIVERED:
  [*] Digital testing workflows
  [*] CAD integration
  [*] Carbon analytics platform
  [*] Automated reporting
  [*] Dashboards & operational visibility
  [*] Audit-ready reporting

BUSINESS IMPACT:
  [+] Faster, more consistent reporting
  [+] Improved compliance visibility
  [+] Reduced manual administration
  [+] Better operational transparency
  [+] Used as a work-winning differentiator`,

  `> LOADING SIMTEC CASE STUDY DATABASE...

CLIENT:  Geotechnical Engineering Ltd
PROJECT: Eliminating Site Admin Overtime
         Through Real-Time Reporting
──────────────────────────────────────────

Geotechnical Engineering Ltd needed to reduce
operational admin burden and eliminate excessive
overtime caused by manual reporting processes.

WHAT SIMTEC DELIVERED:
  [*] Mobile site diary application
  [*] Real-time reporting workflows
  [*] SharePoint integration
  [*] Site tracking tools
  [*] Delivery & issue logging

BUSINESS IMPACT:
  [+] ~10% time saving across the business
  [+] Overtime admin virtually eliminated
  [+] Improved management visibility
  [+] Faster operational reporting
  [+] Reduced manual administration`,

  `> LOADING SIMTEC CASE STUDY DATABASE...

CLIENT:  Vertase FLI
PROJECT: Standardising Materials Management
         Across Complex Projects
──────────────────────────────────────────

Vertase FLI required a more structured and
scalable approach to materials management,
compliance reporting and operational
visibility across projects.

WHAT SIMTEC DELIVERED:
  [*] Centralised materials management system
  [*] Live materials tracking
  [*] Automated testing imports
  [*] Compliance dashboards
  [*] Reporting automation
  [*] Carbon tracking capability

BUSINESS IMPACT:
  [+] Reduced administrative workload
  [+] Improved auditability and compliance
  [+] Better project consistency
  [+] Reduced dependency on manual processes
  [+] Stronger competitive positioning`,
];

const TYPING_SPEED_MS = 22;

type Pos = { x: number; y: number };

const navBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(0,255,65,0.35)",
  color: "#00ff41",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: 13,
  lineHeight: 1,
  padding: "2px 7px",
  cursor: "pointer",
  textShadow: "0 0 6px rgba(0,255,65,0.5)",
  transition: "border-color 0.15s, background 0.15s",
};

export function ImageBand() {
  const [displayed, setDisplayed] = useState("");
  const [studyIdx, setStudyIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Drag state — null means "use CSS centering"
  const [dragPos, setDragPos] = useState<Pos | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const charIdx = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const goTo = (idx: number) => setStudyIdx((idx + CASE_STUDIES.length) % CASE_STUDIES.length);
  const goPrev = () => goTo(studyIdx - 1);
  const goNext = () => goTo(studyIdx + 1);

  // Typewriter
  useEffect(() => {
    const full = CASE_STUDIES[studyIdx];
    charIdx.current = 0;
    setDisplayed("");
    setIsDone(false);

    const tick = () => {
      if (charIdx.current < full.length) {
        charIdx.current++;
        setDisplayed(full.slice(0, charIdx.current));
        timer.current = setTimeout(tick, TYPING_SPEED_MS);
      } else {
        setIsDone(true);
      }
    };

    timer.current = setTimeout(tick, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [studyIdx]);

  // Auto-scroll terminal body
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [displayed, isDone]);

  // Start drag from title bar
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

  // Toggle body class during drag — CSS handles cursor globally
  useEffect(() => {
    if (isDragging) {
      document.body.classList.add("is-dragging");
    } else {
      document.body.classList.remove("is-dragging");
    }
    return () => { document.body.classList.remove("is-dragging"); };
  }, [isDragging]);

  // Mouse move / up listeners
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragOrigin.current.mouseX;
      const dy = e.clientY - dragOrigin.current.mouseY;
      const section = sectionRef.current;
      const win = windowRef.current;
      if (!section || !win) return;
      const maxX = section.offsetWidth - win.offsetWidth;
      const maxY = section.offsetHeight - win.offsetHeight;
      setDragPos({
        x: Math.max(0, Math.min(maxX, dragOrigin.current.posX + dx)),
        y: Math.max(0, Math.min(maxY, dragOrigin.current.posY + dy)),
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

  const windowPositionStyle: React.CSSProperties =
    dragPos !== null
      ? { position: "absolute", left: dragPos.x, top: dragPos.y }
      : { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <section
      ref={sectionRef as React.Ref<HTMLElement>}
      className="relative h-screen overflow-hidden"
    >
      {/* Background image */}
      <Image
        src="/image-section.jpg"
        alt="Construction site"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />

      {/* Terminal window */}
      <div
        ref={windowRef}
        style={{
          ...windowPositionStyle,
          width: "min(680px, calc(100vw - 64px))",
          zIndex: 10,
        }}
      >
        {/* Title bar — drag handle */}
        <div
          onMouseDown={handleTitleMouseDown}
          className="terminal-title-bar"
          style={{
            background: "rgba(10, 10, 10, 0.4)",
            border: "2px solid #00ff41",
            borderBottom: "1px solid #00aa28",
            padding: "7px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "'Courier New', Courier, monospace",
            backdropFilter: "blur(6px)",
            userSelect: "none",
          }}
        >
          {/* Dots */}
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {([0.3, 0.5, 1] as const).map((o, i) => (
              <span
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#00ff41",
                  display: "inline-block",
                  opacity: o,
                }}
              />
            ))}
          </div>

          {/* Title */}
          <span
            style={{
              color: "#00ff41",
              fontSize: 11,
              letterSpacing: "0.14em",
              opacity: 0.85,
              textTransform: "uppercase",
            }}
          >
            SIMTEC TERMINAL — CASE STUDIES
          </span>

          {/* Navigation arrows — stop propagation so they don't trigger drag */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 4 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span style={{ color: "#00ff41", fontSize: 10, opacity: 0.5, marginRight: 4, letterSpacing: "0.06em" }}>
              {studyIdx + 1}/{CASE_STUDIES.length}
            </span>
            <button
              style={navBtnStyle}
              onClick={goPrev}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00ff41";
                e.currentTarget.style.background = "rgba(0,255,65,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,255,65,0.35)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {"<"}
            </button>
            <button
              style={navBtnStyle}
              onClick={goNext}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00ff41";
                e.currentTarget.style.background = "rgba(0,255,65,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,255,65,0.35)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {">"}
            </button>
          </div>
        </div>

        {/* Terminal body */}
        <div
          ref={bodyRef}
          className={`terminal-scrollarea${isDone ? " terminal-scrollbar-on" : ""}`}
          style={{
            background: "rgba(5, 5, 5, 0.4)",
            backdropFilter: "blur(6px)",
            border: "2px solid #00ff41",
            borderTop: "none",
            padding: "28px 32px 32px",
            height: 480,
            overflowY: "auto",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 14,
            lineHeight: 1.8,
            color: "#00ff41",
            textShadow: "0 0 10px rgba(0, 255, 65, 0.55)",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.012) 2px, rgba(0,255,65,0.012) 4px)",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            {displayed}
            {!isDone && <span className="terminal-cursor">█</span>}
          </pre>

          {isDone && (
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span className="terminal-cursor">█</span>
              <button
                onClick={goNext}
                style={{
                  background: "transparent",
                  border: "1px solid #00ff41",
                  color: "#00ff41",
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  padding: "5px 18px",
                  cursor: "pointer",
                  textShadow: "0 0 8px rgba(0,255,65,0.7)",
                  boxShadow: "0 0 10px rgba(0,255,65,0.2)",
                  textTransform: "uppercase",
                  transition: "background 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,255,65,0.12)";
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(0,255,65,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(0,255,65,0.2)";
                }}
              >
                SEE NEXT CASE STUDY
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
