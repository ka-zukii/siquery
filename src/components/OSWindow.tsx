import React, { useState, useRef, useEffect, useCallback } from "react";
import type { WindowState } from "../hooks/useWindowManager";

interface OSWindowProps {
  windowState: WindowState;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: string; height: string };
  /** true bila ini jendela paling depan; jendela lain tampil redup seperti macOS */
  isActive?: boolean;
  /** ruang kosong di bawah saat jendela di-zoom (supaya tidak tertutup Dock) */
  bottomInset?: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const TITLEBAR_HEIGHT = 38;
const VISIBLE_WIDTH = 200;
const VISIBLE_HEIGHT = 120;

export const OSWindow: React.FC<OSWindowProps> = ({
  windowState,
  defaultPosition = { x: 40, y: 40 },
  defaultSize = { width: "850px", height: "520px" },
  isActive = true,
  bottomInset = 0,
  onClose,
  onMinimize,
  onFocus,
  children,
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // State untuk menahan lifecycle komponen sampai animasi selesai
  const [shouldRender, setShouldRender] = useState(windowState.isOpen);
  const [animClass, setAnimClass] = useState("animate-mac-open");

  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  // Sinkronisasi animasi saat status isOpen atau isMinimized berubah
  useEffect(() => {
    if (windowState.isOpen && !windowState.isMinimized) {
      setShouldRender(true);
      setAnimClass("animate-mac-open");
    } else if (windowState.isOpen && windowState.isMinimized) {
      setAnimClass("animate-mac-minimize pointer-events-none");
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 450); // sesuai durasi mac-minimize
      return () => clearTimeout(timer);
    } else if (!windowState.isOpen) {
      setAnimClass("animate-mac-close pointer-events-none");
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsZoomed(false); // dibuka lagi nanti dalam ukuran normal
      }, 200); // sesuai durasi mac-close
      return () => clearTimeout(timer);
    }
  }, [windowState.isOpen, windowState.isMinimized]);

  const clampPosition = useCallback((left: number, top: number) => {
    const element = windowRef.current;
    const parent = element?.parentElement;

    if (!element || !parent) {
      return { x: left, y: top };
    }

    const windowWidth = element.offsetWidth;
    const minX = Math.min(0, VISIBLE_WIDTH - windowWidth);
    const maxX = Math.max(0, parent.clientWidth - VISIBLE_WIDTH);
    const minY = 0;
    const maxY = Math.max(0, parent.clientHeight - VISIBLE_HEIGHT);

    return {
      x: Math.max(minX, Math.min(left, maxX)),
      y: Math.max(minY, Math.min(top, maxY)),
    };
  }, []);

  const toggleZoom = () => setIsZoomed((z) => !z);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".win-controls")) return;

    const element = windowRef.current;
    if (!element) return;

    e.preventDefault();
    onFocus();

    // Jendela yang sedang di-zoom tidak bisa digeser
    if (isZoomed) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: element.offsetLeft,
      initialTop: element.offsetTop,
    };

    setIsDragging(true);
  };

  const handleTitlebarDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".win-controls")) return;
    toggleZoom();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const nextLeft = dragRef.current.initialLeft + deltaX;
      const nextTop = dragRef.current.initialTop + deltaY;

      setPosition(clampPosition(nextLeft, nextTop));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, clampPosition]);

  useEffect(() => {
    const element = windowRef.current;
    const parent = element?.parentElement;

    if (!element || !parent) return;

    const observer = new ResizeObserver(() => {
      if (isZoomed) return;
      setPosition((current) => clampPosition(current.x, current.y));
    });

    observer.observe(parent);
    observer.observe(element);

    return () => observer.disconnect();
  }, [clampPosition, isZoomed]);

  if (!shouldRender) return null;

  const geometry: React.CSSProperties = isZoomed
    ? {
        left: 0,
        top: 0,
        width: "100%",
        height: `calc(100% - ${bottomInset}px)`,
      }
    : {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: defaultSize.width,
        height: defaultSize.height,
      };

  // Lampu lalu lintas: berwarna saat jendela aktif atau saat kursor di atasnya.
  // Nama kelas ditulis utuh (bukan disusun dari string) supaya terdeteksi Tailwind.
  const RED = isActive ? "bg-mac-red" : "bg-paper/25 group-hover:bg-mac-red";
  const YELLOW = isActive ? "bg-lamp" : "bg-paper/25 group-hover:bg-lamp";
  const GREEN = isActive
    ? "bg-[#28c840]"
    : "bg-paper/25 group-hover:bg-[#28c840]";

  const lightBase =
    "win-btn flex h-3.25 w-3.25 cursor-pointer items-center justify-center rounded-full border border-black/30 text-[0px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp group-hover:after:font-extrabold group-hover:after:text-black/70";

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={{
        position: "absolute",
        zIndex: windowState.zIndex,
        maxWidth: "100%",
        maxHeight: "100%",
        boxSizing: "border-box",
        ...geometry,
      }}
      className={`os-window flex flex-col overflow-hidden border border-paper/12 bg-panel font-sans text-paper origin-bottom ${
        isZoomed ? "rounded-none" : "rounded-xl"
      } ${
        isActive
          ? "shadow-[0_28px_70px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.45)]"
          : "shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.4)]"
      } ${
        isDragging
          ? ""
          : "transition-[left,top,width,height,box-shadow] duration-250 ease-out motion-reduce:transition-none"
      } ${animClass}`}
    >
      {/* Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTitlebarDoubleClick}
        style={{
          height: TITLEBAR_HEIGHT,
          minHeight: TITLEBAR_HEIGHT,
        }}
        className={`win-titlebar flex shrink-0 select-none items-center border-b border-paper/10 px-3 transition-colors ${
          isActive ? "bg-panel-hi" : "bg-panel"
        } ${isZoomed ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {/* Lampu lalu lintas: tutup, minimalkan, zoom */}
        <div className="win-controls group flex flex-row items-center gap-2">
          <button
            type="button"
            aria-label="Tutup jendela"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`${lightBase} btn-close ${RED} group-hover:after:content-['✕'] group-hover:after:text-[8px]`}
          />

          <button
            type="button"
            aria-label="Minimalkan jendela"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className={`${lightBase} btn-min ${YELLOW} group-hover:after:content-['−'] group-hover:after:text-[11px]`}
          />

          <button
            type="button"
            aria-label={
              isZoomed ? "Kembalikan ukuran jendela" : "Perbesar jendela"
            }
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            className={`${lightBase} btn-zoom ${GREEN} group-hover:after:content-['+'] group-hover:after:text-[11px]`}
          />
        </div>

        {/* Judul jendela: di tengah, mengimbangi lebar tiga tombol di kiri */}
        <div
          className={`win-title flex flex-1 items-center justify-center gap-1.5 pr-14 text-center text-[0.8rem] font-semibold transition-colors ${
            isActive ? "text-paper/85" : "text-paper/40"
          }`}
        >
          {windowState.title}
        </div>
      </div>

      {/* Isi jendela */}
      <div className="win-body flex min-h-0 flex-1 flex-col overflow-hidden bg-mac-solid text-paper">
        {children}
      </div>
    </div>
  );
};
