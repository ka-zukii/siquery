import React, { useCallback, useEffect, useState } from "react";
import { useWindowManager } from "../hooks/useWindowManager";
import { useSound } from "../hooks/useSound";
import type { CaseData } from "../types/case.types";
import {
  LogoIcon,
  ExitIcon,
  WifiIcon,
  BatteryIcon,
  MENU_ITEM,
} from "./desktop/constants/desktop.constants";
import { DesktopIcons } from "./desktop/components/DesktopIcons";
import { DesktopAppWindows } from "./desktop/components/DesktopAppWindows";
import { DesktopDock } from "./desktop/components/DesktopDock";
import { getInbox } from "../utils/inbox";

interface DesktopProps {
  caseData: CaseData;
  /** Dipanggil saat pemain meninggalkan komputer dan kembali ke meja 3D */
  onExit?: () => void;
}

/* ------------------------------------------------------------------ */
/* Dock                                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Komponen                                                             */
/* ------------------------------------------------------------------ */

export const Desktop: React.FC<DesktopProps> = ({ caseData, onExit }) => {
  const { playSound } = useSound();
  const [now, setNow] = useState(() => new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);

  const inbox = getInbox(caseData);
  const [readMail, setReadMail] = useState<string[]>([]);
  const markMailRead = useCallback(
    (id: string) =>
      setReadMail((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [],
  );
  const unreadMail = inbox.filter((m) => !readMail.includes(m.id)).length;

  const { windows, openWindow, closeWindow, minimizeWindow, focusWindow } =
    useWindowManager([
      { id: "siquery", title: "SiQuery DB Studio" },
      { id: "unimail", title: "UniMail - Kotak Masuk" },
      { id: "notepad", title: "Catatan Investigasi" },
      { id: "report", title: "Laporkan Kasus" },
      { id: "music", title: "Musik" },
    ]);

  // Jam di menubar berjalan
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);


  // Esc: tutup menu apel dulu; kalau tidak ada menu terbuka, berdiri dari
  // komputer dan kembali ke meja 3D.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (appleMenuOpen) {
        setAppleMenuOpen(false);
        return;
      }
      onExit?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, appleMenuOpen]);

  const handleAppOpen = (id: string) => {
    playSound("open");
    openWindow(id);
  };

  const handleAppClose = (id: string) => {
    playSound("close");
    closeWindow(id);
  };

  // Jendela paling depan = aplikasi aktif (namanya tampil tebal di menubar)
  const visible = Object.entries(windows)
    .filter(([, w]) => w.isOpen && !w.isMinimized)
    .sort((a, b) => b[1].zIndex - a[1].zIndex);
  const activeId = visible[0]?.[0] ?? null;
  const activeTitle = activeId ? windows[activeId].title : "Meja Kerja";

  const dateLabel = now.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeLabel = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-desk font-sans">
      {/* Wallpaper: cahaya lampu meja dan bayangan tepi meja */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_12%_-8%,rgba(240,184,75,0.2),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_40%)]" />

      {/* Watermark wallpaper */}
      <div
        className="pointer-events-none absolute bottom-6 left-8 font-display text-5xl font-extrabold leading-none tracking-tight text-paper/[0.07]"
        aria-hidden="true"
      >
        SiQuery
        <span className="mt-1 block text-xl font-medium">
          Perpustakaan Kampus
        </span>
      </div>

      {/* Menubar */}
      <header className="absolute left-0 right-0 top-0 z-100 flex h-7 items-center justify-between border-b border-paper/8 bg-desk/60 px-2 text-xs font-medium text-mac-text backdrop-blur-[30px]">
        <div className="flex items-center gap-1">
          {/* Menu logo (setara menu apel) */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={appleMenuOpen}
              aria-label="Menu SiQuery OS"
              onClick={() => setAppleMenuOpen((o) => !o)}
              className={`flex cursor-pointer items-center rounded px-2.5 py-1 text-lamp transition-colors hover:bg-paper/12 focus-visible:outline-2 focus-visible:outline-lamp ${
                appleMenuOpen ? "bg-paper/15" : ""
              }`}
            >
              <LogoIcon />
            </button>

            {appleMenuOpen && (
              <>
                {/* Klik di luar menu menutupnya */}
                <button
                  type="button"
                  aria-label="Tutup menu"
                  tabIndex={-1}
                  onClick={() => setAppleMenuOpen(false)}
                  className="fixed inset-0 z-99 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute left-0 top-7.5 z-100 min-w-60 rounded-lg border border-paper/15 bg-desk/80 p-1.5 text-[0.8rem] shadow-[0_18px_44px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setAppleMenuOpen(false)}
                    className="flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left text-paper hover:bg-lamp hover:text-[#1d1608]"
                  >
                    Tentang SiQuery OS
                  </button>

                  {onExit && (
                    <>
                      <div className="my-1.5 border-t border-paper/12" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAppleMenuOpen(false);
                          onExit();
                        }}
                        className="group flex w-full cursor-pointer items-center justify-between gap-6 rounded-md px-2.5 py-1.5 text-left text-paper hover:bg-lamp hover:text-[#1d1608]"
                      >
                        <span>Kembali ke meja</span>
                        <kbd className="font-sans text-[0.7rem] text-paper/50 group-hover:text-[#1d1608]/70">
                          Esc
                        </kbd>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <span className="px-2 py-0.5 font-bold text-paper">
            {activeTitle}
          </span>
          <span className={MENU_ITEM}>Berkas</span>
          <span className={MENU_ITEM}>Ubah</span>
          <span className={MENU_ITEM}>Tampilan</span>
          <span className={MENU_ITEM}>Jendela</span>
          <span className={MENU_ITEM}>Bantuan</span>
        </div>

        <div className="flex items-center gap-3">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-0.5 text-lamp transition-colors hover:bg-lamp/15 focus-visible:outline-2 focus-visible:outline-lamp"
            >
              <ExitIcon />
              Kembali ke meja
            </button>
          )}
          <span className="text-mac-muted" aria-hidden="true">
            <WifiIcon />
          </span>
          <span className="text-mac-muted" aria-hidden="true">
            <BatteryIcon />
          </span>
          <span className="text-mac-text">
            {dateLabel}
            <span className="ml-2 font-mono text-[0.72rem]">{timeLabel}</span>
          </span>
        </div>
      </header>

      <DesktopIcons onOpen={handleAppOpen} unreadMail={unreadMail} />

      <DesktopAppWindows
        caseData={caseData}
        windows={windows}
        activeId={activeId}
        onClose={handleAppClose}
        minimizeWindow={minimizeWindow}
        focusWindow={focusWindow}
        inbox={inbox}
        readMail={readMail}
        onReadMail={markMailRead}
      />

      <DesktopDock windows={windows} onExit={onExit} onOpen={handleAppOpen} />
    </div>
  );
};
