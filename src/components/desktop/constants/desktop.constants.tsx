import React from "react";

export const DOCK_BASE = 50; // ukuran ikon dock (px) saat tidak dibesarkan
export const DOCK_PEAK = 1.5; // skala ikon yang ditunjuk kursor
export const DOCK_FALLOFF = 0.28; // berkurangnya skala per ikon tetangga
export const DOCK_CLEARANCE = 92; // ruang yang disisakan untuk jendela yang di-zoom

export interface DockApp {
  id: string;
  label: string;
  icon: string;
  tile: string;
}

export const DOCK_APPS: DockApp[] = [
  {
    id: "siquery",
    label: "DB Studio",
    icon: "🗄️",
    tile: "linear-gradient(160deg,#47b995 0%,#1d5f4a 100%)",
  },
  {
    id: "unimail",
    label: "UniMail",
    icon: "✉️",
    tile: "linear-gradient(160deg,#6db3ff 0%,#2c63d6 100%)",
  },
  {
    id: "notepad",
    label: "Catatan",
    icon: "📝",
    tile: "linear-gradient(160deg,#f7dc7a 0%,#dfa629 100%)",
  },
];

export const EXIT_INDEX = DOCK_APPS.length; // ikon "Meja" ada setelah pemisah

export const dockScale = (index: number, hovered: number | null) => {
  if (hovered === null) return 1;
  return Math.max(1, DOCK_PEAK - Math.abs(index - hovered) * DOCK_FALLOFF);
};

/* ------------------------------------------------------------------ */
/* Ikon kecil (SVG supaya tidak bergantung pada font emoji)             */
/* ------------------------------------------------------------------ */

export const LogoIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M12.8 12.8 17 17" />
  </svg>
);

export const ExitIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 3.5H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H8" />
    <path d="M12.5 6.5 16 10l-3.5 3.5M16 10H8" />
  </svg>
);

export const WifiIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M2.5 7.5a10.5 10.5 0 0 1 15 0M5.2 10.6a6.6 6.6 0 0 1 9.6 0M7.9 13.6a2.8 2.8 0 0 1 4.2 0" />
    <circle cx="10" cy="16.2" r="0.6" fill="currentColor" />
  </svg>
);

export const BatteryIcon: React.FC = () => (
  <svg
    width="20"
    height="15"
    viewBox="0 0 26 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    aria-hidden="true"
  >
    <rect x="1" y="2.5" width="21" height="11" rx="3" opacity="0.7" />
    <rect
      x="3"
      y="4.5"
      width="15"
      height="7"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />
    <path d="M24 6v4" strokeLinecap="round" opacity="0.7" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Ikon desktop (kanan atas, seperti ikon berkas di macOS)              */
/* ------------------------------------------------------------------ */

export const ICON_BUTTON =
  "desktop-icon group relative flex w-22.5 cursor-pointer flex-col items-center rounded-lg p-2 text-center transition-colors hover:bg-paper/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";
export const ICON_TILE =
  "icon-img mb-1.5 flex h-12 w-12 items-center justify-center rounded-xl border border-paper/12 bg-panel text-2xl shadow-[0_6px_14px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-105";
export const ICON_LABEL =
  "text-[0.74rem] text-paper drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]";

export const MENU_ITEM =
  "cursor-pointer rounded px-2 py-0.5 transition-colors hover:bg-paper/12 focus-visible:outline-2 focus-visible:outline-lamp";
