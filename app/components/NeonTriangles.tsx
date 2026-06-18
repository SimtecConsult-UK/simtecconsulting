'use client';

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
      </defs>

      <g className="neon-triangles-scale-group">
      {/* ── Large cyan triangle — float up-right, 9s — rotateY right 35° ── */}
      <g className="triangle-cyan">
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
          points="928,130 640,658 1248,610"
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
          points="928,130 640,658 1248,610"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          opacity="0.95"
        />
      </g>
      </g>

      {/* ── Medium violet triangle — float down-left, 11s ── */}
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
          points="992,186 688,642 1280,546"
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
          points="992,186 688,642 1280,546"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1"
          opacity="0.95"
        />
      </g>

      {/* ── Pink inner triangle — float up, 7s — rotateY left 20° ── */}
      <g className="triangle-pink">
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
          points="896,258 728,626 1120,578"
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
          points="896,258 728,626 1120,578"
          fill="none"
          stroke="#e040fb"
          strokeWidth="0.9"
          opacity="0.9"
        />
      </g>
      </g>

      {/* ── Inverted deep-violet triangle — float right, 13s — rotateY left 20° ── */}
      <g className="triangle-violet">
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
          points="800,162 1056,594 592,530"
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
          points="800,162 1056,594 592,530"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="0.8"
          opacity="0.65"
        />
      </g>
      </g>
      </g>{/* end neon-triangles-scale-group */}
    </svg>
  );
}
