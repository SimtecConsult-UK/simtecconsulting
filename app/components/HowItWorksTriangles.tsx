import React from "react";

// Steps alternate: 0=left, 1=right, 2=left, 3=right, 4=left
// Triangles sit between steps on the OPPOSITE side, slightly above midpoint
// Stack count oscillates: 3 / 2 / 3 / 2

type Cluster = {
  top: string;
  side: "left" | "right";
  colors: string[];
  size: number;
  dur: string;
  tx: string;
};

const CLUSTERS: Cluster[] = [
  {
    top: "calc(18% - 50px)", side: "right",
    colors: ["#00e5ff", "#a855f7", "#e040fb"],
    size: 580, dur: "9s",
    tx: "0,0; 6,-18; -4,10; 0,0",
  },
  {
    top: "calc(38% - 50px)", side: "left",
    colors: ["#a855f7", "#7c3aed"],
    size: 520, dur: "12s",
    tx: "0,0; -5,15; 4,-11; 0,0",
  },
  {
    top: "calc(57% - 50px)", side: "right",
    colors: ["#e040fb", "#00e5ff", "#a855f7"],
    size: 560, dur: "7s",
    tx: "0,0; -4,-20; 3,8; 0,0",
  },
  {
    top: "calc(76% - 50px)", side: "left",
    colors: ["#7c3aed", "#e040fb"],
    size: 540, dur: "11s",
    tx: "0,0; 7,13; -5,-9; 0,0",
  },
];

// Returns stacked polygon points for layer 0 (outer) → 2 (inner) in a s×s viewBox
function pts(s: number, layer: number): string {
  // Each layer slightly inset — different tilt on each to mimic hero stacking
  const defs = [
    [s * 0.50, s * 0.04, s * 0.03, s * 0.94, s * 0.97, s * 0.87],
    [s * 0.50, s * 0.12, s * 0.09, s * 0.92, s * 0.91, s * 0.85],
    [s * 0.50, s * 0.20, s * 0.15, s * 0.90, s * 0.85, s * 0.82],
  ];
  const [x1, y1, x2, y2, x3, y3] = defs[layer] ?? defs[0];
  return `${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}`;
}

export function HowItWorksTriangles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      {CLUSTERS.map((c, ci) => {
        const pos: React.CSSProperties = {
          position: "absolute",
          top: c.top,
          width: c.size,
          height: c.size,
          ...(c.side === "left" ? { left: 0 } : { right: 0 }),
        };

        return (
          <div key={ci} style={pos}>
            <svg
              aria-hidden
              viewBox={`0 0 ${c.size} ${c.size}`}
              width={c.size}
              height={c.size}
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: "visible" }}
            >
              <defs>
                {c.colors.map((_, li) => (
                  <filter key={li} id={`hiw-g${ci}-${li}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>

              {/* All layers share one translate animation — cluster moves as a unit */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={c.tx}
                  keyTimes="0;0.33;0.66;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                  dur={c.dur}
                  repeatCount="indefinite"
                />

                {c.colors.map((color, li) => {
                  const p = pts(c.size, li);
                  const baseOpacity = 0.5 - li * 0.06;
                  const pulseDur = `${4 + li * 1.5}s`;
                  const pulseBegin = `${li * 0.9}s`;
                  return (
                    <g key={li} opacity={baseOpacity}>
                      <polygon
                        points={p}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.8 - li * 0.3}
                        filter={`url(#hiw-g${ci}-${li})`}
                      >
                        <animate
                          attributeName="opacity"
                          values="0.65;1;0.65"
                          dur={pulseDur}
                          begin={pulseBegin}
                          repeatCount="indefinite"
                          calcMode="spline"
                          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                        />
                      </polygon>
                      <polygon
                        points={p}
                        fill="none"
                        stroke={color}
                        strokeWidth={0.8 - li * 0.1}
                        opacity={0.9}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
