import React, { useEffect, useRef } from "react";
import { getAnalyser } from "@/shared/audio/player";
import { reduceMotion } from "@/features/apps/music/utils/motion";

/** Latar gradient yang sedikit menyala mengikuti hentakan bass */
export const BassGlow: React.FC<{ from: string; to: string }> = ({ from, to }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;

    const analyser = getAnalyser();
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf = 0;
    let level = 0;

    const tick = () => {
      let target = 0;
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        // Empat bin pertama = frekuensi rendah (bass)
        let sum = 0;
        for (let i = 0; i < 4; i++) sum += data[i];
        target = sum / (4 * 255);
      }
      // Dihaluskan supaya tidak berkedip terlalu cepat
      level += (target - level) * 0.2;
      el.style.opacity = String(0.22 + level * 0.45);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
      style={{
        opacity: 0.3,
        background: `radial-gradient(120% 80% at 50% 0%, ${from} 0%, transparent 70%), radial-gradient(100% 70% at 50% 110%, ${to} 0%, transparent 70%)`,
      }}
    />
  );
};
