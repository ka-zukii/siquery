import React, { useEffect, useState } from "react";

// Desktop: layar minimal 1024px dan perangkat utamanya mouse atau trackpad
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;

export const DesktopOnlyGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ok, setOk] = useState(isDesktop);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setOk(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (ok) return <>{children}</>;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-desk p-6 text-center text-paper">
      <div className="max-w-sm rounded-[10px] bg-paper p-7 text-ink shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
        <p
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
          className="text-[12px] uppercase tracking-[0.2em] opacity-60"
        >
          Perangkat belum didukung
        </p>
        <h1
          style={{ fontFamily: "Fraunces, Georgia, 'Times New Roman', serif" }}
          className="mt-3 text-3xl font-bold leading-tight"
        >
          Buka SiQuery di komputer
        </h1>
        <p
          style={{
            fontFamily:
              "'Instrument Sans', system-ui, -apple-system, sans-serif",
          }}
          className="mt-4 text-[15px] leading-relaxed opacity-80"
        >
          Game ini membutuhkan layar yang lebar dan keyboard untuk menulis SQL.
          Buka lagi dari komputer atau laptop dengan lebar layar minimal 1024
          piksel.
        </p>
      </div>
    </div>
  );
};
