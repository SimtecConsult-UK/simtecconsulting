"use client";

const particles = [
  { size: 4, color: "#00dcff", left: "15%", top: "70%", dur: "4.2s", delay: "0s"   },
  { size: 3, color: "#ff3cbe", left: "80%", top: "60%", dur: "3.7s", delay: "0.8s" },
  { size: 5, color: "#00dcff", left: "25%", top: "80%", dur: "5.1s", delay: "1.5s" },
  { size: 3, color: "#ff3cbe", left: "70%", top: "75%", dur: "4.8s", delay: "0.3s" },
  { size: 4, color: "#00dcff", left: "50%", top: "85%", dur: "3.9s", delay: "2.1s" },
  { size: 2, color: "#ff3cbe", left: "35%", top: "65%", dur: "4.5s", delay: "1.0s" },
  { size: 3, color: "#00dcff", left: "88%", top: "70%", dur: "5.3s", delay: "0.5s" },
  { size: 4, color: "#ff3cbe", left: "10%", top: "55%", dur: "4.0s", delay: "1.8s" },
];

export function RobotScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <style>{`
        @keyframes rb-sway {
          0%,100% { transform: translateY(0px)   rotate(-1.2deg); }
          25%      { transform: translateY(-9px)  rotate(0.8deg);  }
          50%      { transform: translateY(-18px) rotate(1.5deg);  }
          75%      { transform: translateY(-9px)  rotate(-0.5deg); }
        }
        @keyframes rb-glow {
          0%,100% {
            filter: drop-shadow(0 0 6px rgba(0,220,255,.5))
                    drop-shadow(0 0 16px rgba(0,220,255,.25))
                    drop-shadow(0 0 3px rgba(255,60,190,.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(0,220,255,.8))
                    drop-shadow(0 0 30px rgba(0,220,255,.4))
                    drop-shadow(0 0 8px rgba(255,60,190,.7));
          }
        }
        @keyframes rb-ring {
          0%,100% { transform: scale(1);   opacity: .6; }
          50%      { transform: scale(1.1); opacity: 1;  }
        }
        @keyframes rb-shadow {
          0%,100% { transform: translateX(-50%) scaleX(1);    opacity: .6; }
          50%      { transform: translateX(-50%) scaleX(.75);  opacity: .3; }
        }
        @keyframes rb-float {
          0%   { transform: translateY(0) translateX(0);    opacity: 0;  }
          10%  { opacity: .9; }
          90%  { opacity: .7; }
          100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
        }
        @keyframes rb-play-pulse {
          0%   { transform: scale(.8); opacity: .8; }
          60%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(.8); opacity: 0;  }
        }
        @keyframes rb-play-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.8); opacity: 0;  }
        }
        @keyframes rb-eye {
          0%,100% { box-shadow: 0 0 6px #00dcff, 0 0 12px #00dcff; opacity: 1;   }
          50%      { box-shadow: 0 0 14px #00dcff, 0 0 28px #00dcff, 0 0 4px #fff; opacity: .7; }
        }
        .rb-play-pulse::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid rgba(0,220,255,.25);
          animation: rb-play-ring 1.8s ease-out infinite;
        }
      `}</style>

      {/* Ambient glow ring */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: "320px", height: "320px",
          background: "radial-gradient(ellipse at center, rgba(0,220,255,.06) 0%, rgba(255,60,190,.04) 40%, transparent 70%)",
          animation: "rb-ring 2.8s ease-in-out infinite",
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            background: p.color,
            left: p.left, top: p.top,
            opacity: 0,
            animation: `rb-float ${p.dur} linear ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Robot + overlays */}
      <div className="relative z-10 inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/3.png"
          alt="Simtec Robot"
          style={{
            width: "340px",
            transformOrigin: "center bottom",
            animation: "rb-sway 6s ease-in-out infinite, rb-glow 2.8s ease-in-out infinite",
          }}
        />

        {/* Eye glow — left */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 10, height: 10,
            background: "#00dcff",
            top: "14.5%", left: "38%",
            boxShadow: "0 0 8px #00dcff, 0 0 16px #00dcff",
            animation: "rb-eye 2.5s ease-in-out infinite",
            zIndex: 3,
          }}
        />
        {/* Eye glow — right */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 10, height: 10,
            background: "#00dcff",
            top: "14.5%", left: "55%",
            boxShadow: "0 0 8px #00dcff, 0 0 16px #00dcff",
            animation: "rb-eye 2.5s ease-in-out infinite",
            zIndex: 3,
          }}
        />

        {/* Play-button pulse on tablet */}
        <div
          className="rb-play-pulse pointer-events-none absolute rounded-full"
          style={{
            top: "38%", left: "34%",
            width: 42, height: 42,
            background: "rgba(0,220,255,.3)",
            animation: "rb-play-pulse 1.8s ease-out infinite",
            zIndex: 3,
          }}
        />
      </div>

      {/* Ground shadow */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: -10, left: "50%",
          transform: "translateX(-50%)",
          width: 200, height: 30,
          background: "radial-gradient(ellipse, rgba(0,220,255,.25) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(4px)",
          animation: "rb-shadow 3s ease-in-out infinite",
        }}
      />
    </div>
  );
}
