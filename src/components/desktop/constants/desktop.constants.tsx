import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBatteryThreeQuarters,
  faDatabase,
  faDoorOpen,
  faEnvelope,
  faMagnifyingGlass,
  faFileSignature,
  faNoteSticky,
  faWifi,
  faMusic,
  faBook,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export const DOCK_BASE = 50; // ukuran ikon dock (px) saat tidak dibesarkan
export const DOCK_PEAK = 1.5; // skala ikon yang ditunjuk kursor
export const DOCK_FALLOFF = 0.28; // berkurangnya skala per ikon tetangga
export const DOCK_CLEARANCE = 92; // ruang yang disisakan untuk jendela yang di-zoom

export interface DockApp {
  id: string;
  label: string;
  icon: IconDefinition;
  /** warna glyph di atas tile */
  glyphColor: string;
  tile: string;
}

export const DOCK_APPS: DockApp[] = [
  {
    id: "siquery",
    label: "DB Studio",
    icon: faDatabase,
    glyphColor: "#ffffff",
    tile: "linear-gradient(160deg,#47b995 0%,#1d5f4a 100%)",
  },
  {
    id: "unimail",
    label: "UniMail",
    icon: faEnvelope,
    glyphColor: "#ffffff",
    tile: "linear-gradient(160deg,#6db3ff 0%,#2c63d6 100%)",
  },
  {
    id: "notepad",
    label: "Catatan",
    icon: faNoteSticky,
    glyphColor: "#5a3e00",
    tile: "linear-gradient(160deg,#f7dc7a 0%,#dfa629 100%)",
  },
  {
    id: "report",
    label: "Laporkan",
    icon: faFileSignature,
    glyphColor: "#ffffff",
    tile: "linear-gradient(160deg,#e07a5f 0%,#9c3b24 100%)",
  },
  {
    id: "music",
    label: "Musik",
    icon: faMusic,
    glyphColor: "#ffffff",
    tile: "linear-gradient(160deg,#ff6b8b 0%,#d7265a 100%)",
  },
  {
    id: "guide",
    label: "Panduan",
    icon: faBook,
    glyphColor: "#ffffff",
    tile: "linear-gradient(160deg,#9b8cff 0%,#4b3fb5 100%)",
  },
];

export const EXIT_INDEX = DOCK_APPS.length; // ikon "Meja" ada setelah pemisah
export const EXIT_ICON: IconDefinition = faDoorOpen;

export const dockScale = (index: number, hovered: number | null) => {
  if (hovered === null) return 1;
  return Math.max(1, DOCK_PEAK - Math.abs(index - hovered) * DOCK_FALLOFF);
};

/* ------------------------------------------------------------------ */
/* Ikon dock                                                            */
/* ------------------------------------------------------------------ */

/** Glyph ikon dock. Ukurannya mengikuti font-size tombol induknya. */
export const DockGlyph: React.FC<{ icon: IconDefinition; color?: string }> = ({
  icon,
  color,
}) => (
  <FontAwesomeIcon
    icon={icon}
    aria-hidden="true"
    style={color ? { color } : undefined}
  />
);

/* ------------------------------------------------------------------ */
/* Ikon menubar                                                         */
/* ------------------------------------------------------------------ */

/** Ikon logo di menubar (setara menu apel). Ukuran dalam px. */
export const LogoIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <FontAwesomeIcon
    icon={faMagnifyingGlass}
    aria-hidden="true"
    style={{ fontSize: size }}
  />
);

/** Ikon "Kembali ke meja". Ukuran dalam px. */
export const ExitIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <FontAwesomeIcon
    icon={EXIT_ICON}
    aria-hidden="true"
    style={{ fontSize: size }}
  />
);

export const WifiIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <FontAwesomeIcon
    icon={faWifi}
    aria-hidden="true"
    style={{ fontSize: size }}
  />
);

export const BatteryIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <FontAwesomeIcon
    icon={faBatteryThreeQuarters}
    aria-hidden="true"
    style={{ fontSize: size }}
  />
);

/* ------------------------------------------------------------------ */
/* Kelas Tailwind bersama                                               */
/* ------------------------------------------------------------------ */

export const ICON_BUTTON =
  "desktop-icon group relative flex w-22.5 cursor-pointer flex-col items-center rounded-lg p-2 text-center transition-colors hover:bg-paper/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";
export const ICON_TILE =
  "icon-img mb-1.5 flex h-12 w-12 items-center justify-center rounded-xl border border-paper/12 bg-panel text-2xl shadow-[0_6px_14px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-105";
export const ICON_LABEL =
  "text-[0.74rem] text-paper drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]";

export const MENU_ITEM =
  "cursor-pointer rounded px-2 py-0.5 transition-colors hover:bg-paper/12 focus-visible:outline-2 focus-visible:outline-lamp";
