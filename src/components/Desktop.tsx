import React from "react";
import { useWindowManager } from "../hooks/useWindowManager";
import { useSound } from "../hooks/useSound";
import { OSWindow } from "./OSWindow";
import { SiQueryStudio } from "./SiQueryStudio";
import type { CaseData } from "../types/case.types";

interface DesktopProps {
  caseData: CaseData;
}

export const Desktop: React.FC<DesktopProps> = ({ caseData }) => {
  const { playSound } = useSound();

  const { windows, openWindow, closeWindow, minimizeWindow, focusWindow } =
    useWindowManager([
      { id: "siquery", title: "SiQuery DB Studio" },
      { id: "unimail", title: "UniMail - Inbox" },
      { id: "notepad", title: "Detective Notes" },
    ]);

  const handleAppOpen = (id: string) => {
    playSound("open");
    openWindow(id);
  };

  const handleAppClose = (id: string) => {
    playSound("close");
    closeWindow(id);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-[#1b1464]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,#ff6ec4_0%,transparent_45%),radial-gradient(ellipse_at_85%_20%,#7873f5_0%,transparent_50%),radial-gradient(ellipse_at_50%_100%,#0a84ff_0%,transparent_55%)]" />

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-100 flex h-7 items-center justify-between border-b border-white/5 bg-[#141418]/55 px-3 text-xs font-medium text-mac-text backdrop-blur-[30px]">
        <div className="flex items-center gap-3">
          <span className="font-bold"> SiQuery OS</span>

          <span className="cursor-pointer rounded px-2 py-0.5 hover:bg-white/15">
            File
          </span>

          <span className="cursor-pointer rounded px-2 py-0.5 hover:bg-white/15">
            Edit
          </span>

          <span className="cursor-pointer rounded px-2 py-0.5 hover:bg-white/15">
            View
          </span>
        </div>

        <span>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </header>

      {/* Desktop icons */}
      <div className="desktop-icons absolute right-4 top-11 z-10 flex flex-col gap-3.5">
        <button
          type="button"
          onClick={() => handleAppOpen("siquery")}
          className="desktop-icon group flex w-22.5 cursor-pointer flex-col items-center rounded-lg p-2 text-center transition-all hover:bg-white/12"
        >
          <div className="icon-img mb-1 text-4xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-105">
            💾
          </div>
          <span className="text-[0.74rem] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            DB Studio
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleAppOpen("unimail")}
          className="desktop-icon group relative flex w-22.5 cursor-pointer flex-col items-center rounded-lg p-2 text-center transition-all hover:bg-white/12"
        >
          <div className="icon-img mb-1 text-4xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-105">
            ✉️
          </div>

          <span className="absolute -right-1 -top-0.5 rounded-full bg-mac-red px-1.5 py-0.5 text-[0.65rem] font-bold text-white shadow-[0_0_0_2px_rgba(0,0,0,0.2)]">
            2
          </span>

          <span className="text-[0.74rem] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            UniMail
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleAppOpen("notepad")}
          className="desktop-icon group flex w-22.5 cursor-pointer flex-col items-center rounded-lg p-2 text-center transition-all hover:bg-white/12"
        >
          <div className="icon-img mb-1 text-4xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-105">
            📝
          </div>

          <span className="text-[0.74rem] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Notepad
          </span>
        </button>
      </div>

      {/* Window container: dimulai tepat di bawah header */}
      <main className="absolute inset-x-0 bottom-0 top-7 overflow-hidden">
        {/* SiQuery */}
        <OSWindow
          windowState={windows["siquery"]}
          onClose={() => handleAppClose("siquery")}
          onMinimize={() => minimizeWindow("siquery")}
          onFocus={() => focusWindow("siquery")}
        >
          <SiQueryStudio caseData={caseData} />
        </OSWindow>

        {/* UniMail */}
        <OSWindow
          windowState={windows["unimail"]}
          onClose={() => handleAppClose("unimail")}
          onMinimize={() => minimizeWindow("unimail")}
          onFocus={() => focusWindow("unimail")}
        >
          <div className="grid h-full grid-cols-[250px_1fr] overflow-hidden bg-mac-solid">
            <div className="space-y-1 overflow-y-auto border-r border-mac-sep bg-mac-sidebar p-1.5">
              <div className="cursor-pointer rounded-lg bg-mac-accent p-2.5 text-white">
                <div className="text-xs font-semibold">Kepala Perpustakaan</div>

                <div className="truncate text-[0.76rem]">
                  Laporan Kehilangan Codex
                </div>

                <div className="mt-0.5 text-[0.68rem] text-white/80">
                  25 Okt 2026
                </div>
              </div>
            </div>

            <div className="overflow-y-auto p-6 text-mac-text">
              <h3 className="mb-1 text-lg font-semibold">
                Penting: Penyelidikan Kasus {caseData.title}
              </h3>

              <div className="mb-4 border-b border-mac-sep pb-3 text-xs text-mac-muted">
                Dari: head@library.univ.ac.id • Untuk: detective@siquery.os
              </div>

              <p className="text-sm leading-relaxed text-[#e5e5ea]">
                {caseData.briefing}
              </p>
            </div>
          </div>
        </OSWindow>

        {/* Notepad */}
        <OSWindow
          windowState={windows["notepad"]}
          onClose={() => handleAppClose("notepad")}
          onMinimize={() => minimizeWindow("notepad")}
          onFocus={() => focusWindow("notepad")}
        >
          <textarea
            className="h-full w-full resize-none bg-[#fff8d6] p-5 font-['Marker_Felt','Noteworthy',sans-serif] text-base leading-relaxed text-[#3a3a3c] focus:outline-none"
            placeholder="Tulis catatan petunjuk investigasi di sini..."
          />
        </OSWindow>
      </main>
    </div>
  );
};
