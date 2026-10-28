import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faEnvelope,
  faNoteSticky,
  faFileSignature,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

interface DesktopIconsProps {
  onOpen: (id: string) => void;
}

interface IconDef {
  id: string;
  label: string;
  icon: IconDefinition;
  /** warna gradasi tile */
  gradient: string;
  /** warna glyph di atas tile */
  glyphColor: string;
  badge?: number;
}

const ICONS: IconDef[] = [
  {
    id: "siquery",
    label: "DB Studio",
    icon: faDatabase,
    gradient: "linear-gradient(180deg,#5fcaa6 0%,#2a7a60 100%)",
    glyphColor: "#ffffff",
  },
  {
    id: "unimail",
    label: "UniMail",
    icon: faEnvelope,
    gradient: "linear-gradient(180deg,#7cc0ff 0%,#2f6fe0 100%)",
    glyphColor: "#ffffff",
    badge: 2,
  },
  {
    id: "notepad",
    label: "Catatan",
    icon: faNoteSticky,
    gradient: "linear-gradient(180deg,#ffe38a 0%,#e8a72c 100%)",
    glyphColor: "#5a3e00",
  },
  {
    id: "report",
    label: "Laporkan",
    icon: faFileSignature,
    gradient: "linear-gradient(180deg,#f0937a 0%,#b5462c 100%)",
    glyphColor: "#ffffff",
  },
];

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpen }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Klik di luar ikon membatalkan seleksi, seperti di Finder
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setSelected(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className="desktop-icons absolute right-4 top-11 z-10 flex flex-col items-center gap-5"
    >
      {ICONS.map((item) => {
        const isSelected = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={`Buka ${item.label}`}
            aria-pressed={isSelected}
            onClick={() => setSelected(item.id)}
            onDoubleClick={() => onOpen(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onOpen(item.id);
            }}
            className="group flex w-24 cursor-default flex-col items-center gap-1.5 outline-none focus-visible:[&_.icon-label]:outline-2 focus-visible:[&_.icon-label]:outline-offset-2 focus-visible:[&_.icon-label]:outline-lamp"
          >
            {/* Tile squircle */}
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-[18px] shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
              style={{ background: item.gradient }}
            >
              {/* Kilau di separuh atas */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[18px] bg-white/20"
                aria-hidden="true"
              />
              {/* Garis tipis di tepi dalam */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-black/20"
                aria-hidden="true"
              />

              <FontAwesomeIcon
                icon={item.icon}
                aria-hidden="true"
                className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
                style={{ fontSize: 28, color: item.glyphColor }}
              />

              {/* Lapisan biru saat terpilih */}
              {isSelected && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-[18px] bg-[#0a64d8]/45"
                  aria-hidden="true"
                />
              )}

              {/* Lencana notifikasi */}
              {item.badge !== undefined && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[11px] font-semibold leading-none text-white shadow-[0_0_0_2px_#0e1714]">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Label: putih dengan bayangan, blok biru saat terpilih */}
            <span
              className={`icon-label max-w-full rounded-sm px-1.5 py-px text-center text-[12px] leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
                isSelected ? "bg-[#0a64d8] drop-shadow-none" : ""
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
