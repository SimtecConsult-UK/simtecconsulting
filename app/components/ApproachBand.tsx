"use client";

import { useEffect, useRef } from "react";
import { RobotScene } from "./RobotScene";

export function ApproachBand() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const imgEl = imgRef.current;
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    const syncSize = () => {
      canvas.width = imgEl.offsetWidth;
      canvas.height = imgEl.offsetHeight;
    };

    const drawPixelated = (pixelSize: number, alpha: number) => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      if (alpha <= 0 || w === 0 || h === 0) return;
      const pw = Math.max(1, Math.floor(w / pixelSize));
      const ph = Math.max(1, Math.floor(h / pixelSize));
      const off = document.createElement("canvas");
      off.width = pw;
      off.height = ph;
      off.getContext("2d")!.drawImage(imgEl, 0, 0, pw, ph);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, w, h);
      ctx.restore();
    };

    const startAnimation = () => {
      const duration = 1400;
      const start = performance.now();
      const animate = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        drawPixelated(Math.max(1, Math.round(48 * (1 - eased))), 1 - eased);
        if (t < 1) rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
    };

    const init = () => {
      syncSize();
      drawPixelated(48, 1);

      const ro = new ResizeObserver(() => { syncSize(); drawPixelated(48, 1); });
      ro.observe(imgEl);

      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { observer.disconnect(); startAnimation(); } },
        { threshold: 0.15 }
      );
      observer.observe(canvas);

      return () => { ro.disconnect(); observer.disconnect(); };
    };

    let cleanup: (() => void) | undefined;
    if (imgEl.complete) {
      cleanup = init();
    } else {
      imgEl.onload = () => { cleanup = init(); };
    }

    return () => { cancelAnimationFrame(rafId); cleanup?.(); };
  }, []);

  return (
    <section
      className="flex min-h-screen flex-col items-center justify-between px-4 pb-16 pt-24 md:px-16"
      style={{ background: "#edeaf8" }}
    >
      <h2
        className="mx-auto max-w-[760px] text-center text-[42px] font-bold leading-[1.06] tracking-[-0.02em] text-[#1a1530] sm:text-[54px] md:text-[66px]"
        style={{ fontFamily: "var(--font-league-spartan)" }}
      >
        Simtec takes a different approach.
      </h2>

      <div className="mx-auto flex w-full max-w-[680px] flex-col items-center gap-8 md:flex-row md:items-end md:gap-12">

        {/* Image + pixelated canvas overlay */}
        <div className="relative flex-1">
          <img
            ref={imgRef}
            src="/mockupipad2.png"
            alt="Before building systems, we understand your workflows"
            className="w-full"
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        </div>

        <div className="h-[320px] w-[280px] shrink-0">
          <RobotScene />
        </div>

      </div>
    </section>
  );
}
