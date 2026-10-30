import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWindowManager } from "@/shared/hooks/useWindowManager";
import { useDb } from "@/shared/context/DatabaseContext";
import { SolvedNotice } from "@/shared/ui/SolvedNotice";
import { useSound } from "@/shared/audio/useSound";
import type { CaseData } from "@/types/case.types";
import {
  LogoIcon,
  ExitIcon,
  WifiIcon,
  BatteryIcon,
} from "./constants/desktop.constants";
import { MenuBarDropdown, AboutDialog, type MenuEntry } from "./components/MenuBar";
import { useDisplayPrefs } from "@/shared/display/useDisplayPrefs";
import { DesktopIcons } from "./components/DesktopIcons";
import { DesktopAppWindows } from "./components/DesktopAppWindows";
import { DesktopDock } from "./components/DesktopDock";
import { getInbox } from "@/shared/utils/inbox";
import { CoachMarks } from "@/shared/ui/CoachMarks";
import {
  DESKTOP_TOUR,
  DESKTOP_TOUR_KEY,
  STUDIO_TOUR,
  STUDIO_TOUR_KEY,
  isTourDone,
  markTourDone,
} from "@/content/coachMarks";
import { clearTourDone } from "@/content/coachMarks";
import { markCaseSolved } from "@/content/progress";

interface DesktopProps {
  caseData: CaseData;
  /** Dipanggil saat pemain meninggalkan komputer dan kembali ke meja 3D */
  onExit?: () => void;
  /** Dipanggil dari notifikasi "Pilih chapter" setelah kasus selesai */
  onChooseChapter?: () => void;
}

/* ------------------------------------------------------------------ */
/* Dock                                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Komponen                                                             */
/* ------------------------------------------------------------------ */

export const Desktop: React.FC<DesktopProps> = ({
  caseData,
  onExit,
  onChooseChapter,
}) => {
  const { playSound } = useSound();
  const [now, setNow] = useState(() => new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { prefs: displayPrefs, update: updateDisplay } = useDisplayPrefs();
  const editableRef = useRef<HTMLElement | null>(null);

  // Notifikasi selesai muncul di dalam laptop saat kasus baru saja terpecahkan.
  // Saat laptop dibuka lagi di kasus yang sudah selesai, notifikasi tidak muncul ulang.
  const { solved } = useDb();
  const wasSolved = useRef(solved);
  const [solvedOpen, setSolvedOpen] = useState(false);
  useEffect(() => {
    if (solved && !wasSolved.current) {
      setSolvedOpen(true);
      markCaseSolved(caseData.id);
    }
    wasSolved.current = solved;
  }, [solved]);

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
      { id: "guide", title: "Panduan" },
    ]);

  // Tur pengenalan: meja dulu, lalu DB Studio saat pertama kali dibuka
  const [desktopTourDone, setDesktopTourDone] = useState(() =>
    isTourDone(DESKTOP_TOUR_KEY),
  );
  const [desktopTourOn, setDesktopTourOn] = useState(false);
  const [studioTourDone, setStudioTourDone] = useState(() =>
    isTourDone(STUDIO_TOUR_KEY),
  );

  useEffect(() => {
    if (desktopTourDone) return;
    const t = setTimeout(() => setDesktopTourOn(true), 700);
    return () => clearTimeout(t);
  }, [desktopTourDone]);

  const finishDesktopTour = useCallback(() => {
    markTourDone(DESKTOP_TOUR_KEY);
    setDesktopTourOn(false);
    setDesktopTourDone(true);
  }, []);

  const finishStudioTour = useCallback(() => {
    markTourDone(STUDIO_TOUR_KEY);
    setStudioTourDone(true);
  }, []);

  // Dari panduan: tur meja diputar ulang, lalu tur Studio menyusul
  const replayTours = useCallback(() => {
    clearTourDone(DESKTOP_TOUR_KEY);
    clearTourDone(STUDIO_TOUR_KEY);
    setStudioTourDone(false);
    setDesktopTourDone(false);
  }, []);

  // Panduan lama untuk chapter 01 tampil dulu, tur Studio menyusul
  const studioTourOn =
    windows["siquery"].isOpen &&
    desktopTourDone &&
    !studioTourDone;

  // Jam di menubar berjalan
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Esc: tutup notifikasi dulu, lalu menu apel. Kalau tidak ada yang terbuka,
  // berdiri dari komputer dan kembali ke meja 3D.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (solvedOpen) return; // SolvedNotice menangani Esc sendiri
      if (aboutOpen) {
        setAboutOpen(false);
        return;
      }
      if (openMenu || appleMenuOpen) {
        setOpenMenu(null);
        setAppleMenuOpen(false);
        return;
      }
      onExit?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, appleMenuOpen, solvedOpen, openMenu, aboutOpen]);

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

  /* ---- Menubar: pelacak editor aktif untuk menu Ubah ---- */
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches?.("textarea, input[type='text'], [contenteditable='true']")) {
        editableRef.current = t;
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  // Perintah edit dijalankan pada editor terakhir yang difokuskan
  const editAction = (cmd: string, value?: string) => {
    const el = editableRef.current;
    if (!el?.isConnected) return;
    el.focus();
    document.execCommand(cmd, false, value);
  };

  const pasteFromClipboard = () => {
    navigator.clipboard
      ?.readText()
      .then((text) => editAction("insertText", text))
      .catch(() => {});
  };

  const openWindowEntries: MenuEntry[] = Object.values(windows)
    .filter((w) => w.isOpen)
    .sort((a, b) => b.zIndex - a.zIndex)
    .map((w) => ({
      type: "item" as const,
      label: w.isMinimized ? `${w.title} (diminimalkan)` : w.title,
      check: w.id === activeId,
      onSelect: () => openWindow(w.id),
    }));

  const menus: Record<string, MenuEntry[]> = {
    Berkas: [
      { type: "item", label: "Buka DB Studio", onSelect: () => handleAppOpen("siquery") },
      { type: "item", label: "Buka Kotak Masuk", onSelect: () => handleAppOpen("unimail") },
      { type: "item", label: "Buka Catatan Investigasi", onSelect: () => handleAppOpen("notepad") },
      { type: "item", label: "Buka Laporan Kasus", onSelect: () => handleAppOpen("report") },
      { type: "sep" },
      {
        type: "item",
        label: "Tutup Jendela Aktif",
        disabled: !activeId,
        onSelect: () => {
          if (activeId) handleAppClose(activeId);
        },
      },
    ],
    Ubah: [
      { type: "item", label: "Batalkan", onSelect: () => editAction("undo") },
      { type: "item", label: "Ulangi", onSelect: () => editAction("redo") },
      { type: "sep" },
      { type: "item", label: "Potong", onSelect: () => editAction("cut") },
      { type: "item", label: "Salin", onSelect: () => editAction("copy") },
      { type: "item", label: "Tempel", onSelect: pasteFromClipboard },
      { type: "item", label: "Hapus", onSelect: () => editAction("delete") },
      { type: "sep" },
      { type: "item", label: "Pilih Semua", onSelect: () => editAction("selectAll") },
    ],
    Tampilan: [
      {
        type: "item",
        label: "Kurangi Animasi",
        check: displayPrefs.reduceMotion,
        onSelect: () =>
          updateDisplay({ reduceMotion: !displayPrefs.reduceMotion }),
      },
      {
        type: "item",
        label: "Teks Lebih Besar",
        check: displayPrefs.largeText,
        onSelect: () => updateDisplay({ largeText: !displayPrefs.largeText }),
      },
    ],
    Jendela: [
      ...(openWindowEntries.length
        ? openWindowEntries
        : [{ type: "item" as const, label: "Tidak ada jendela terbuka", disabled: true, onSelect: () => {} }]),
      { type: "sep" },
      {
        type: "item",
        label: "Minimalkan Jendela Aktif",
        disabled: !activeId,
        onSelect: () => {
          if (activeId) minimizeWindow(activeId);
        },
      },
      {
        type: "item",
        label: "Tutup Semua Jendela",
        disabled: openWindowEntries.length === 0,
        onSelect: () =>
          Object.values(windows).forEach((w) => {
            if (w.isOpen) closeWindow(w.id);
          }),
      },
    ],
    Bantuan: [
      { type: "item", label: "Buka Panduan", onSelect: () => handleAppOpen("guide") },
      { type: "item", label: "Putar Ulang Tur Meja", onSelect: replayTours },
      { type: "sep" },
      { type: "item", label: "Tentang SiQuery OS", onSelect: () => setAboutOpen(true) },
    ],
  };

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
      <header data-tour="menubar" className="absolute left-0 right-0 top-0 z-100 flex h-7 items-center justify-between border-b border-paper/8 bg-desk/60 px-2 text-xs font-medium text-mac-text backdrop-blur-[30px]">
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
                    onClick={() => {
                      setAppleMenuOpen(false);
                      setAboutOpen(true);
                    }}
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
          {Object.keys(menus).map((name) => (
            <MenuBarDropdown
              key={name}
              label={name}
              entries={menus[name]}
              isOpen={openMenu === name}
              anyOpen={openMenu !== null}
              onToggle={() => setOpenMenu((o) => (o === name ? null : name))}
              onEnter={() => setOpenMenu(name)}
              onClose={() => setOpenMenu(null)}
            />
          ))}
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
        onReplayTour={replayTours}
      />

      <DesktopDock windows={windows} onExit={onExit} onOpen={handleAppOpen} />

      {/* Klik di luar menu bilah menu menutupnya */}
      {(openMenu !== null || appleMenuOpen) && (
        <button
          type="button"
          aria-label="Tutup menu"
          tabIndex={-1}
          className="fixed inset-0 z-90 cursor-default"
          onClick={() => {
            setOpenMenu(null);
            setAppleMenuOpen(false);
          }}
        />
      )}
      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}

      {/* Notifikasi kasus terpecahkan, tampil di layar laptop */}
      {solvedOpen && (
        <SolvedNotice
          caseData={caseData}
          onClose={() => setSolvedOpen(false)}
          onChooseChapter={() => onChooseChapter?.()}
        />
      )}
      <CoachMarks
        steps={DESKTOP_TOUR}
        active={desktopTourOn}
        onDone={finishDesktopTour}
      />
      <CoachMarks
        steps={STUDIO_TOUR}
        active={studioTourOn}
        onDone={finishStudioTour}
      />
    </div>
  );
};
