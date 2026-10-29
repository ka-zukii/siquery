import React, { useEffect, useRef } from "react";
import { reduceMotion } from "@/features/apps/music/utils/motion";

type Mote = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  ph: number;
};

/** Debu cahaya yang melayang pelan di bawah sorotan lampu arsip */
export const DustMotes: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g || reduceMotion()) return;

    const COUNT = 28;
    let motes: Mote[] = [];
    let raf = 0;
    let last = performance.now();

    const spawn = (w: number, h: number): Mote => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.012,
      vy: -(0.004 + Math.random() * 0.01),
      a: 0.3 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
    });

    const draw = (now: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        motes = Array.from({ length: COUNT }, () => spawn(w, h));
      }

      const dt = Math.min(64, now - last);
      last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#fff3d6";

      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.ph += dt * 0.001;
        if (m.y < -4) {
          m.y = h + 4;
          m.x = Math.random() * w;
        }
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;

        // Kelip pelan supaya tidak terlihat seperti titik statis
        g.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(m.ph * 2));
        g.beginPath();
        g.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Sorotan lampu dari atas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-5]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,240,200,0.14), transparent 70%)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-5] h-full w-full"
      />
    </>
  );
};
