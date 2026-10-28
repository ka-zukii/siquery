import React from "react";
import { ICON_BUTTON, ICON_TILE, ICON_LABEL } from "../constants/desktop.constants";

interface DesktopIconsProps {
  onOpen: (id: string) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpen }) => (
  <div className="desktop-icons absolute right-4 top-11 z-10 flex flex-col gap-3.5">
    <button
      type="button"
      onClick={() => onOpen("siquery")}
      className={ICON_BUTTON}
    >
      <div className={ICON_TILE}>🗄️</div>
      <span className={ICON_LABEL}>DB Studio</span>
    </button>

    <button
      type="button"
      onClick={() => onOpen("unimail")}
      className={ICON_BUTTON}
    >
      <div className={ICON_TILE}>✉️</div>

      <span className="absolute right-3 top-1 rounded-full bg-mac-red px-1.5 py-0.5 text-[0.65rem] font-bold text-white shadow-[0_0_0_2px_rgba(14,23,20,0.9)]">
        2
      </span>

      <span className={ICON_LABEL}>UniMail</span>
    </button>

    <button
      type="button"
      onClick={() => onOpen("notepad")}
      className={ICON_BUTTON}
    >
      <div className={ICON_TILE}>📝</div>
      <span className={ICON_LABEL}>Catatan</span>
    </button>
  </div>
);
