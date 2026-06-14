export function NeonTriangles() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 820"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Large cyan — wide sweep, center-left, 9s ── */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 6,-18; -4,10; 0,0"
          keyTimes="0; 0.33; 0.66; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="9s"
          repeatCount="indefinite"
        />
        <polygon
          points="680,55 120,820 1240,760"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.8"
          filter="url(#glow-cyan)"
        >
          <animate
            attributeName="opacity"
            values="0.8; 1; 0.8"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </polygon>
        <polygon
          points="680,55 120,820 1240,760"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          opacity="0.95"
        />
      </g>

      {/* ── Medium violet — right side, 11s ── */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -8,14; 5,-12; 0,0"
          keyTimes="0; 0.4; 0.7; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="11s"
          repeatCount="indefinite"
        />
        <polygon
          points="1100,100 820,680 1400,620"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.8"
          filter="url(#glow-purple)"
        >
          <animate
            attributeName="opacity"
            values="0.75; 1; 0.75"
            dur="6s"
            begin="1.5s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </polygon>
        <polygon
          points="1100,100 820,680 1400,620"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1"
          opacity="0.95"
        />
      </g>

      {/* ── Pink — left side, smaller, 7s ── */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -6,-22; 4,8; 0,0"
          keyTimes="0; 0.5; 0.75; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="7s"
          repeatCount="indefinite"
        />
        <polygon
          points="300,170 60,640 540,580"
          fill="none"
          stroke="#e040fb"
          strokeWidth="1.6"
          filter="url(#glow-pink)"
        >
          <animate
            attributeName="opacity"
            values="0.7; 1; 0.7"
            dur="5s"
            begin="0.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </polygon>
        <polygon
          points="300,170 60,640 540,580"
          fill="none"
          stroke="#e040fb"
          strokeWidth="0.9"
          opacity="0.9"
        />
      </g>

      {/* ── Deep-violet — center background, 13s ── */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 8,16; -5,-10; 0,0"
          keyTimes="0; 0.45; 0.72; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="13s"
          repeatCount="indefinite"
        />
        <polygon
          points="720,210 460,740 980,700"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="1.4"
          filter="url(#glow-purple)"
        >
          <animate
            attributeName="opacity"
            values="0.45; 0.75; 0.45"
            dur="7s"
            begin="2s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </polygon>
        <polygon
          points="720,210 460,740 980,700"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="0.8"
          opacity="0.65"
        />
      </g>

      {/* ── Green — upper-far-right, 10s ── */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -5,12; 7,-8; 0,0"
          keyTimes="0; 0.38; 0.68; 1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          dur="10s"
          repeatCount="indefinite"
        />
        <polygon
          points="1260,75 1040,660 1480,660"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.6"
          filter="url(#glow-cyan)"
        >
          <animate
            attributeName="opacity"
            values="0.7; 1; 0.7"
            dur="5.5s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </polygon>
        <polygon
          points="1260,75 1040,660 1480,660"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="0.9"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
