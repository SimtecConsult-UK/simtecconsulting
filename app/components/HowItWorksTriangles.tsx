export function HowItWorksTriangles() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 1800"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id="hiw-glow-cyan" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hiw-glow-purple" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hiw-glow-pink" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Top-right — cyan, 9s ── */}
      <g opacity="0.45">
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 7,-16; -4,10; 0,0"
          keyTimes="0; 0.33; 0.66; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="9s" repeatCount="indefinite"
        />
        <polygon points="1180,60 920,340 1400,290"
          fill="none" stroke="#00e5ff" strokeWidth="1.6"
          filter="url(#hiw-glow-cyan)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        </polygon>
        <polygon points="1180,60 920,340 1400,290"
          fill="none" stroke="#00e5ff" strokeWidth="0.8" opacity="0.9" />
      </g>

      {/* ── Top-left — purple, 12s ── */}
      <g opacity="0.38">
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; -6,14; 5,-10; 0,0"
          keyTimes="0; 0.4; 0.7; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="12s" repeatCount="indefinite"
        />
        <polygon points="120,100 30,360 340,280"
          fill="none" stroke="#a855f7" strokeWidth="1.5"
          filter="url(#hiw-glow-purple)">
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="6s" begin="1s"
            repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        </polygon>
        <polygon points="120,100 30,360 340,280"
          fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.8" />
      </g>

      {/* ── Mid-right — pink, 7s ── */}
      <g opacity="0.4">
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; -5,-20; 4,8; 0,0"
          keyTimes="0; 0.5; 0.75; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="7s" repeatCount="indefinite"
        />
        <polygon points="1250,720 1020,1020 1430,950"
          fill="none" stroke="#e040fb" strokeWidth="1.5"
          filter="url(#hiw-glow-pink)">
          <animate attributeName="opacity" values="0.65;1;0.65" dur="5s" begin="0.5s"
            repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        </polygon>
        <polygon points="1250,720 1020,1020 1430,950"
          fill="none" stroke="#e040fb" strokeWidth="0.8" opacity="0.85" />
      </g>

      {/* ── Mid-left — cyan, 10s ── */}
      <g opacity="0.35">
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 8,12; -6,-8; 0,0"
          keyTimes="0; 0.45; 0.72; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="10s" repeatCount="indefinite"
        />
        <polygon points="80,760 20,1060 340,980"
          fill="none" stroke="#00e5ff" strokeWidth="1.3"
          filter="url(#hiw-glow-cyan)">
          <animate attributeName="opacity" values="0.5;0.85;0.5" dur="7s" begin="2s"
            repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        </polygon>
        <polygon points="80,760 20,1060 340,980"
          fill="none" stroke="#00e5ff" strokeWidth="0.7" opacity="0.75" />
      </g>

      {/* ── Lower-right — purple, 11s ── */}
      <g opacity="0.38">
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 6,-14; -5,9; 0,0"
          keyTimes="0; 0.35; 0.68; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="11s" repeatCount="indefinite"
        />
        <polygon points="1150,1300 900,1560 1400,1480"
          fill="none" stroke="#7c3aed" strokeWidth="1.4"
          filter="url(#hiw-glow-purple)">
          <animate attributeName="opacity" values="0.55;0.9;0.55" dur="6s" begin="1.5s"
            repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        </polygon>
        <polygon points="1150,1300 900,1560 1400,1480"
          fill="none" stroke="#7c3aed" strokeWidth="0.7" opacity="0.7" />
      </g>

      {/* ── Bottom-left — pink, 8s ── */}
      <g opacity="0.33">
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; -7,15; 5,-9; 0,0"
          keyTimes="0; 0.42; 0.74; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="8s" repeatCount="indefinite"
        />
        <polygon points="160,1450 60,1700 400,1640"
          fill="none" stroke="#e040fb" strokeWidth="1.2"
          filter="url(#hiw-glow-pink)">
          <animate attributeName="opacity" values="0.5;0.85;0.5" dur="5s" begin="3s"
            repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        </polygon>
        <polygon points="160,1450 60,1700 400,1640"
          fill="none" stroke="#e040fb" strokeWidth="0.7" opacity="0.7" />
      </g>
    </svg>
  );
}
