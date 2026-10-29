import React, { useEffect, useRef } from "react";
import { getAnalyser } from "@/shared/audio/player";

/** Batang spektrum melingkar di dalam kotak artwork */
export const SpectrumRing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    const analyser = getAnalyser();
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const BARS = 48;
    let raf = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);

      if (analyser && data) analyser.getByteFrequencyData(data);

      const cx = w / 2;
      const cy = h / 2;
      const size = Math.min(w, h);
      const inner = size * 0.36;
      const maxLen = size * 0.14;

      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineCap = "round";
      g.lineWidth = Math.max(2, size * 0.02);

      for (let i = 0; i < BARS; i++) {
        // Memakai sebagian awal spektrum (frekuensi rendah) supaya lebih hidup
        const bin = data ? Math.floor((i / BARS) * data.length * 0.6) : 0;
        const v = data ? data[bin] / 255 : 0;
        const len = Math.max(2, v * maxLen);
        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        g.beginPath();
        g.moveTo(cx + cos * inner, cy + sin * inner);
        g.lineTo(cx + cos * (inner + len), cy + sin * (inner + len));
        g.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};
