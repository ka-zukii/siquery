import React from "react";
import { OSWindow } from "../../OSWindow";
import { SiQueryStudio } from "../../SiQueryStudio";
import type { CaseData } from "../../../types/case.types";
import type { useWindowManager } from "../../../hooks/useWindowManager";
import { DOCK_CLEARANCE } from "../constants/desktop.constants";
import { NotepadApp } from "./Notepad";
import { ReportApp } from "./ReportApp";
import { UniMailApp } from "./UniMailApp";
import type { EmailItem } from "../../../types/case.types";
import { MusicApp } from "./MusicApp";
import { GuideApp } from "./GuideApp";

type WindowsState = ReturnType<typeof useWindowManager>["windows"];

interface DesktopAppWindowsProps {
  caseData: CaseData;
  windows: WindowsState;
  activeId: string | null;
  onClose: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  inbox: EmailItem[];
  readMail: string[];
  onReadMail: (id: string) => void;
}

export const DesktopAppWindows: React.FC<DesktopAppWindowsProps> = ({
  caseData,
  windows,
  activeId,
  onClose,
  minimizeWindow,
  focusWindow,
  inbox,
  readMail,
  onReadMail,
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
      <UniMailApp
        inbox={inbox}
        readIds={readMail}
        onRead={onReadMail}
        isOpen={windows["unimail"].isOpen}
      />
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
      <NotepadApp />
    </OSWindow>

    {/* Laporkan Kasus */}
    <OSWindow
      windowState={windows["report"]}
      isActive={activeId === "report"}
      bottomInset={DOCK_CLEARANCE}
      defaultPosition={{ x: 160, y: 70 }}
      defaultSize={{ width: "560px", height: "520px" }}
      onClose={() => onClose("report")}
      onMinimize={() => minimizeWindow("report")}
      onFocus={() => focusWindow("report")}
    >
      <ReportApp report={caseData.report} caseTitle={caseData.title} />
    </OSWindow>

    {/* Musik */}
    <OSWindow
      windowState={windows["music"]}
      isActive={activeId === "music"}
      bottomInset={DOCK_CLEARANCE}
      defaultPosition={{ x: 200, y: 90 }}
      defaultSize={{ width: "640px", height: "420px" }}
      onClose={() => onClose("music")}
      onMinimize={() => minimizeWindow("music")}
      onFocus={() => focusWindow("music")}
    >
      <MusicApp />
    </OSWindow>
    {/* Panduan */}
    <OSWindow
      windowState={windows["guide"]}
      isActive={activeId === "guide"}
      bottomInset={DOCK_CLEARANCE}
      defaultPosition={{ x: 150, y: 80 }}
      defaultSize={{ width: "600px", height: "480px" }}
      onClose={() => onClose("guide")}
      onMinimize={() => minimizeWindow("guide")}
      onFocus={() => focusWindow("guide")}
    >
      <GuideApp caseData={caseData} />
    </OSWindow>
  </main>
);
