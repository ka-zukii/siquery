import React from "react";

/** Tiga batang kecil yang bergerak saat lagu diputar */
export const EqBars: React.FC<{ active: boolean }> = ({ active }) => (
  <span aria-hidden="true" className="flex h-3 w-3.5 items-end gap-px">
    {[0, 0.25, 0.5].map((delay) => (
      <span
        key={delay}
        className="h-full w-0.5 origin-bottom rounded-full bg-current"
        style={{
          animation: "musicEq 0.9s ease-in-out infinite",
          animationDelay: `${delay}s`,
          animationPlayState: active ? "running" : "paused",
          transform: active ? undefined : "scaleY(0.35)",
        }}
      />
    ))}
  </span>
);
