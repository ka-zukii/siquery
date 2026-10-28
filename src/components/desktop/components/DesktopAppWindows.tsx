import React from "react";
import { OSWindow } from "../../OSWindow";
import { SiQueryStudio } from "../../SiQueryStudio";
import type { CaseData } from "../../../types/case.types";
import type { useWindowManager } from "../../../hooks/useWindowManager";
import { DOCK_CLEARANCE } from "../constants/desktop.constants";

type WindowsState = ReturnType<typeof useWindowManager>["windows"];

interface DesktopAppWindowsProps {
  caseData: CaseData;
  windows: WindowsState;
  activeId: string | null;
  onClose: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

export const DesktopAppWindows: React.FC<DesktopAppWindowsProps> = ({
  caseData,
  windows,
  activeId,
  onClose,
  minimizeWindow,
  focusWindow,
}) => (
  <main className="absolute inset-x-0 bottom-0 top-7 overflow-hidden">
    {/* SiQuery */}
    <OSWindow
      windowState={windows["siquery"]}
      isActive={activeId === "siquery"}
      bottomInset={DOCK_CLEARANCE}
      defaultPosition={{ x: 56, y: 28 }}
      onClose={() => onClose("siquery")}
      onMinimize={() => minimizeWindow("siquery")}
      onFocus={() => focusWindow("siquery")}
    >
      <SiQueryStudio caseData={caseData} />
    </OSWindow>

    {/* UniMail */}
    <OSWindow
      windowState={windows["unimail"]}
      isActive={activeId === "unimail"}
      bottomInset={DOCK_CLEARANCE}
      defaultPosition={{ x: 120, y: 64 }}
      defaultSize={{ width: "760px", height: "480px" }}
      onClose={() => onClose("unimail")}
      onMinimize={() => minimizeWindow("unimail")}
      onFocus={() => focusWindow("unimail")}
    >
      <div className="grid h-full grid-cols-[250px_1fr] overflow-hidden bg-mac-solid">
        <div className="space-y-1 overflow-y-auto border-r border-mac-sep bg-mac-sidebar p-1.5">
          <div className="cursor-pointer rounded-lg bg-lamp p-2.5 text-[#1d1608]">
            <div className="text-xs font-semibold">Kepala Perpustakaan</div>

            <div className="truncate text-[0.76rem]">
              Laporan Kehilangan Codex
            </div>

            <div className="mt-0.5 text-[0.68rem] text-[#1d1608]/70">
              25 Okt 2026
            </div>
          </div>
        </div>

        {/* Surat di atas kertas */}
        <div className="overflow-y-auto p-5">
          <div className="min-h-full rounded-md bg-paper p-6 text-ink shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
            <h3 className="font-display mb-1 text-xl font-bold leading-snug">
              Penting: Penyelidikan Kasus {caseData.title}
            </h3>

            <div className="mb-4 border-b border-dashed border-ink/30 pb-3 font-mono text-[0.7rem] text-ink/60">
              Dari: head@library.univ.ac.id • Untuk: detective@siquery.os
            </div>

            <p className="max-w-[62ch] text-sm leading-relaxed text-ink/90">
              {caseData.briefing}
            </p>
          </div>
        </div>
      </div>
    </OSWindow>

    {/* Notepad */}
    <OSWindow
      windowState={windows["notepad"]}
      isActive={activeId === "notepad"}
      bottomInset={DOCK_CLEARANCE}
      defaultPosition={{ x: 220, y: 100 }}
      defaultSize={{ width: "420px", height: "360px" }}
      onClose={() => onClose("notepad")}
      onMinimize={() => minimizeWindow("notepad")}
      onFocus={() => focusWindow("notepad")}
    >
      <textarea
        className="h-full w-full resize-none bg-sticky p-5 font-['Marker_Felt','Noteworthy',sans-serif] text-base leading-relaxed text-[#3b2f08] placeholder:text-[#3b2f08]/50 focus:outline-none"
        placeholder="Tulis catatan petunjuk investigasi di sini..."
      />
    </OSWindow>
  </main>
);
