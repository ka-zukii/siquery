import React from "react";
import type { useWindowManager } from "@/shared/hooks/useWindowManager";
import {
  DOCK_APPS,
  EXIT_INDEX,
  DOCK_BASE,
  dockScale,
  ExitIcon,
  DockGlyph,
} from "@/features/desktop/constants/desktop.constants";

type WindowsState = ReturnType<typeof useWindowManager>["windows"];

interface DesktopDockProps {
  windows: WindowsState;
  onExit?: () => void;
  onOpen: (id: string) => void;
}

export const DesktopDock: React.FC<DesktopDockProps> = ({
  windows,
  onExit,
  onOpen,
}) => {
  const [dockHover, setDockHover] = React.useState<number | null>(null);
  return (
    <nav
      aria-label="Dock"
      onMouseLeave={() => setDockHover(null)}
      className="absolute bottom-2 left-1/2 z-100 flex -translate-x-1/2 items-end gap-2 rounded-[22px] border border-paper/20 bg-paper/10 px-2.5 pb-1.5 pt-2 shadow-[0_18px_44px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
    >
      {DOCK_APPS.map((app, i) => {
        const size = DOCK_BASE * dockScale(i, dockHover);
        const isOpen = !!windows[app.id]?.isOpen;
        return (
          <div key={app.id} className="relative flex flex-col items-center">
            {dockHover === i && (
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-paper/15 bg-desk/85 px-2.5 py-1 text-[0.72rem] text-paper shadow-lg backdrop-blur-xl">
                {app.label}
              </span>
            )}
            <button
              type="button"
              aria-label={`Buka ${app.label}`}
              onMouseEnter={() => setDockHover(i)}
              onFocus={() => setDockHover(i)}
              onBlur={() => setDockHover(null)}
              onClick={() => onOpen(app.id)}
              style={{
                width: size,
                height: size,
                background: app.tile,
                fontSize: size * 0.5,
              }}
              className="flex cursor-pointer items-center justify-center rounded-[22%] border border-black/25 leading-none shadow-[0_6px_14px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[width,height,font-size] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp motion-reduce:transition-none"
            >
              <DockGlyph icon={app.icon} color={app.glyphColor} />
            </button>
            {/* Titik penanda aplikasi yang sedang terbuka */}
            <span
              aria-hidden="true"
              className={`mt-1 h-1 w-1 rounded-full ${isOpen ? "bg-paper/80" : "bg-transparent"}`}
            />
          </div>
        );
      })}

      {onExit && (
        <>
          {/* Pemisah, seperti sebelum Tempat Sampah di macOS */}
          <div
            className="mb-2.5 h-10 w-px self-end bg-paper/20"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center">
            {dockHover === EXIT_INDEX && (
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-paper/15 bg-desk/85 px-2.5 py-1 text-[0.72rem] text-paper shadow-lg backdrop-blur-xl">
                Kembali ke meja
              </span>
            )}
            <button
              type="button"
              aria-label="Kembali ke meja"
              onMouseEnter={() => setDockHover(EXIT_INDEX)}
              onFocus={() => setDockHover(EXIT_INDEX)}
              onBlur={() => setDockHover(null)}
              onClick={onExit}
              style={{
                width: DOCK_BASE * dockScale(EXIT_INDEX, dockHover),
                height: DOCK_BASE * dockScale(EXIT_INDEX, dockHover),
                background: "linear-gradient(160deg,#4a5a54 0%,#1d2723 100%)",
              }}
              className="flex cursor-pointer items-center justify-center rounded-[22%] border border-black/25 text-lamp shadow-[0_6px_14px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-[width,height] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp motion-reduce:transition-none"
            >
              <ExitIcon size={Math.round(DOCK_BASE * 0.5)} />
            </button>
            <span aria-hidden="true" className="mt-1 h-1 w-1" />
          </div>
        </>
      )}
    </nav>
  );
};
