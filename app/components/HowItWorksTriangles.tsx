type TriDef = {
  top: string;
  left?: string;
  right?: string;
  color: string;
  size: number;
  dur: string;
  tx: string;
  opacity: number;
};

const tris: TriDef[] = [
  { top: "3%",  right: "2%",  color: "#00e5ff", size: 320, dur: "9s",  tx: "0,0; 6,-16; -4,9; 0,0",  opacity: 0.45 },
  { top: "9%",  left:  "1%",  color: "#a855f7", size: 270, dur: "12s", tx: "0,0; -5,13; 4,-10; 0,0", opacity: 0.38 },
  { top: "30%", right: "0%",  color: "#e040fb", size: 295, dur: "7s",  tx: "0,0; -4,-18; 3,7; 0,0",  opacity: 0.40 },
  { top: "37%", left:  "1%",  color: "#00e5ff", size: 250, dur: "10s", tx: "0,0; 7,11; -5,-8; 0,0",  opacity: 0.35 },
  { top: "63%", right: "1%",  color: "#7c3aed", size: 285, dur: "11s", tx: "0,0; 5,-13; -4,8; 0,0",  opacity: 0.38 },
  { top: "70%", left:  "2%",  color: "#e040fb", size: 240, dur: "8s",  tx: "0,0; -6,14; 4,-8; 0,0",  opacity: 0.33 },
];

function Tri({ t, i }: { t: TriDef; i: number }) {
  const s = t.size;
  const pts =
    i % 2 === 0
      ? `${s * 0.5},${s * 0.07} ${s * 0.04},${s * 0.87} ${s * 0.96},${s * 0.81}`
      : `${s * 0.5},${s * 0.93} ${s * 0.05},${s * 0.13} ${s * 0.95},${s * 0.19}`;

  const pos: React.CSSProperties = {
    position: "absolute",
    top: t.top,
    width: s,
    height: s,
    opacity: t.opacity,
  };
  if (t.left  !== undefined) pos.left  = t.left;
  if (t.right !== undefined) pos.right = t.right;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${s} ${s}`}
      xmlns="http://www.w3.org/2000/svg"
      style={pos}
    >
      <defs>
        <filter id={`hiw-g-${i}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={t.tx}
          keyTimes="0;0.33;0.66;1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
          dur={t.dur}
          repeatCount="indefinite"
        />
        <polygon
          points={pts}
          fill="none"
          stroke={t.color}
          strokeWidth="1.6"
          filter={`url(#hiw-g-${i})`}
        >
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          />
        </polygon>
        <polygon points={pts} fill="none" stroke={t.color} strokeWidth="0.9" opacity="0.9" />
      </g>
    </svg>
  );
}

export function HowItWorksTriangles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {tris.map((t, i) => (
        <Tri key={i} t={t} i={i} />
      ))}
    </div>
  );
}
