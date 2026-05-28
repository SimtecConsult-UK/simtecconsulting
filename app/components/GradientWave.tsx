type GradientWaveProps = {
  className?: string;
};

export function GradientWave({ className = "" }: GradientWaveProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 820"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        {/* Main ribbon gradient: pink → magenta → purple → blue-violet */}
        <linearGradient id="ribbon-grad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#ff3fa0" />
          <stop offset="30%" stopColor="#e040c8" />
          <stop offset="65%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d7ef5" />
        </linearGradient>
        {/* Shadow ribbon, slightly darker */}
        <linearGradient id="ribbon-shadow" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#c91f7a" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4f63d2" stopOpacity="0.7" />
        </linearGradient>
        {/* Soft edge blur */}
        <filter id="ribbon-blur" x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Shadow ribbon (slightly offset, blurred) */}
      <path
        d="
          M -60 510
          C 220 420, 460 240, 760 360
          S 1140 500, 1500 320
          L 1500 430
          C 1140 610, 820 490, 560 400
          S 80 560, -60 620
          Z
        "
        fill="url(#ribbon-shadow)"
        filter="url(#ribbon-blur)"
        opacity="0.55"
      />

      {/* Main ribbon */}
      <path
        d="
          M -60 470
          C 220 380, 460 200, 760 320
          S 1140 460, 1500 280
          L 1500 390
          C 1140 570, 820 450, 560 360
          S 80 520, -60 580
          Z
        "
        fill="url(#ribbon-grad)"
      />
    </svg>
  );
}
