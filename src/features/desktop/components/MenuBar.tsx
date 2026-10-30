import React from "react";
import { MENU_ITEM } from "../constants/desktop.constants";

export type MenuEntry =
  | { type: "sep" }
  | {
      type: "item";
      label: string;
      onSelect: () => void;
      check?: boolean;
      disabled?: boolean;
    };

interface MenuBarDropdownProps {
  label: string;
  entries: MenuEntry[];
  isOpen: boolean;
  anyOpen: boolean;
  onToggle: () => void;
  onEnter: () => void;
  onClose: () => void;
}

/** Satu menu di bilah menu. Saat satu menu terbuka, hover ke menu lain langsung membukanya. */
export const MenuBarDropdown: React.FC<MenuBarDropdownProps> = ({
  label,
  entries,
  isOpen,
  anyOpen,
  onToggle,
  onEnter,
  onClose,
}) => (
  <div className="relative" onMouseEnter={() => anyOpen && onEnter()}>
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={`${MENU_ITEM} ${isOpen ? "bg-paper/15 text-paper" : ""}`}
    >
      {label}
    </button>

    {isOpen && (
      <div
        role="menu"
        className="absolute left-0 top-7 z-100 min-w-60 rounded-lg border border-paper/15 bg-desk/80 p-1.5 text-[0.8rem] shadow-[0_18px_44px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      >
        {entries.map((entry, i) =>
          entry.type === "sep" ? (
            <div key={`sep-${i}`} className="my-1.5 border-t border-paper/12" />
          ) : (
            <button
              key={`${entry.label}-${i}`}
              type="button"
              role="menuitem"
              disabled={entry.disabled}
              onClick={() => {
                onClose();
                entry.onSelect();
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-paper hover:bg-lamp hover:text-[#1d1608] disabled:cursor-default disabled:text-paper/40 disabled:hover:bg-transparent disabled:hover:text-paper/40"
            >
              <span className="w-3 shrink-0 text-[0.7rem]" aria-hidden="true">
                {entry.check ? "✓" : ""}
              </span>
              <span>{entry.label}</span>
            </button>
          ),
        )}
      </div>
    )}
  </div>
);

/** Dialog "Tentang SiQuery OS". */
export const AboutDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-120 flex items-center justify-center bg-black/40"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      className="w-80 rounded-xl border border-paper/15 bg-desk/90 p-5 text-paper shadow-2xl backdrop-blur-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 id="about-title" className="font-display text-lg font-bold text-lamp">
        SiQuery OS
      </h2>
      <p className="mt-2 text-sm text-paper/80">
        Sistem perpustakaan kampus di dalam game SiQuery: Campus Librarian. Gunakan
        DB Studio untuk menulis kueri SQL dan Laporkan untuk menyerahkan kesimpulanmu.
      </p>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-lamp px-3 py-1 text-sm font-semibold text-[#1d1608]"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
);
