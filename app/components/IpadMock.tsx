"use client";

import { useState, useEffect } from "react";

const slides = [
  "WE SCOPE OUT\nOPERATIONAL\nWORKFLOWS",
  "WE IDENTIFY\nINEFFICIENCIES",
  "WE STRUCTURE\nPROCESSES",
  "WE ALIGN THE\nSTAKEHOLDERS",
  "WE DEFINE\nPRACTICAL OPS\nREQUIREMENTS",
];

const BLEEP_MS = 2700;

export function IpadMock() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide(s => (s + 1) % slides.length);
    }, BLEEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ width: "270px", margin: "0 auto" }}>
      <style>{`
        @keyframes ap-pulse {
          0%   { transform: scale(.8); opacity: .8; }
          60%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(.8); opacity: 0;  }
        }
        @keyframes ap-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.8); opacity: 0;  }
        }
        @keyframes ap-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ap-pulse::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid rgba(0,220,255,.25);
          animation: ap-ring 2.7s ease-out 0s infinite;
        }
      `}</style>

      {/* Device shell */}
      <div
        style={{
          background: "linear-gradient(160deg, #3a3a3c 0%, #1c1c1e 100%)",
          borderRadius: "28px",
          padding: "14px 11px 18px",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.07), " +
            "0 24px 60px rgba(0,0,0,0.45), " +
            "inset 0 1px 0 rgba(255,255,255,0.09), " +
            "inset 0 -1px 0 rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        {/* Right side buttons */}
        {[80, 120].map((top, i) => (
          <div
            key={i}
            style={{
              position: "absolute", right: -3, top,
              width: 3, height: 26,
              background: "linear-gradient(90deg, #2c2c2e, #404042)",
              borderRadius: "0 2px 2px 0",
            }}
          />
        ))}

        {/* Front camera */}
        <div
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#2c2c2e",
            border: "1px solid rgba(255,255,255,0.04)",
            margin: "0 auto 9px",
          }}
        />

        {/* Screen */}
        <div style={{
          borderRadius: "12px",
          overflow: "hidden",
          background: "#0d0d10",
          display: "flex",
          flexDirection: "column",
          minHeight: "290px",
        }}>

          {/* iOS status bar */}
          <div
            style={{
              background: "rgba(18,18,22,0.95)",
              padding: "7px 14px 5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "-apple-system, sans-serif" }}>
              9:41
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                <rect x="0" y="5" width="2.5" height="4" rx="0.4" fill="white" fillOpacity="0.85" />
                <rect x="3.5" y="3" width="2.5" height="6" rx="0.4" fill="white" fillOpacity="0.85" />
                <rect x="7" y="1.5" width="2.5" height="7.5" rx="0.4" fill="white" fillOpacity="0.85" />
                <rect x="10.5" y="0" width="2.5" height="9" rx="0.4" fill="white" fillOpacity="0.25" />
              </svg>
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <rect x="0.5" y="0.5" width="16" height="9" rx="2" stroke="white" strokeOpacity="0.35" />
                <rect x="2" y="2" width="11" height="6" rx="0.8" fill="white" fillOpacity="0.85" />
                <path d="M17.5 3.5v3a1 1 0 000-3z" fill="white" fillOpacity="0.4" />
              </svg>
            </div>
          </div>

          {/* Vertically centered content */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "12px 10px 14px",
          }}>
            <div
              style={{
                background: "rgba(8,10,26,0.55)",
                backdropFilter: "blur(28px) saturate(1.5)",
                WebkitBackdropFilter: "blur(28px) saturate(1.5)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ padding: "16px 14px 18px", position: "relative" }}>

                {/* Label */}
                <div
                  style={{
                    fontSize: 8.5, fontWeight: 700, letterSpacing: "0.13em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                    marginBottom: 7,
                    fontFamily: "-apple-system, sans-serif",
                  }}
                >
                  Before building systems
                </div>

                {/* Sliding main text — key change triggers CSS entrance */}
                <h3
                  key={slide}
                  style={{
                    fontSize: 18, fontWeight: 800, lineHeight: 1.1,
                    color: "#ffffff", margin: "0 0 10px",
                    textTransform: "uppercase", letterSpacing: "-0.02em",
                    fontFamily: "var(--font-league-spartan)",
                    whiteSpace: "pre-line",
                    width: "100%",
                    height: "62px",
                    overflow: "hidden",
                    animation: "ap-slide-in 0.35s ease forwards",
                  }}
                >
                  {slides[slide]}
                </h3>

                {/* iOS-style navigation arrows */}
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 11L5 7L9 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 11L9 7L5 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 12 }} />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="simtec" style={{ height: 13, opacity: 0.45 }} />

                {/* Bleep pulse */}
                <div
                  className="ap-pulse pointer-events-none absolute rounded-full"
                  style={{
                    bottom: "46px",
                    left: "30px",
                    width: 34,
                    height: 34,
                    background: "rgba(0,220,255,.3)",
                    animation: "ap-pulse 2.7s ease-out 0s infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div
          style={{
            width: 34, height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.16)",
            margin: "9px auto 0",
          }}
        />
      </div>
    </div>
  );
}
