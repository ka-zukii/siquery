import React, { useState, useRef, useEffect, useCallback } from "react";
import type { WindowState } from "../hooks/useWindowManager";

interface OSWindowProps {
  windowState: WindowState;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: string; height: string };
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
  onClose,
  onMinimize,
  onFocus,
  children,
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".win-controls")) return;

    const element = windowRef.current;
    if (!element) return;

    e.preventDefault();
    onFocus();

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: element.offsetLeft,
      initialTop: element.offsetTop,
    };

    setIsDragging(true);
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
      setPosition((current) => clampPosition(current.x, current.y));
    });

    observer.observe(parent);
    observer.observe(element);

    return () => observer.disconnect();
  }, [clampPosition]);

  if (!shouldRender) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={{
        position: "absolute",
        zIndex: windowState.zIndex,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: defaultSize.width,
        height: defaultSize.height,
        maxWidth: "100%",
        maxHeight: "100%",
        boxSizing: "border-box",
      }}
      className={`os-window flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#18181b] text-[#f5f5f7] shadow-[0_20px_50px_rgba(0,0,0,0.7)] origin-bottom ${animClass}`}
    >
      {/* Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          height: TITLEBAR_HEIGHT,
          minHeight: TITLEBAR_HEIGHT,
        }}
        className={`win-titlebar flex shrink-0 select-none items-center border-b border-white/8 bg-[#27272a] px-3 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Window Controls (Merah Tutup di Kiri, Kuning Minimize di Kanan) */}
        <div className="win-controls flex flex-row items-center gap-2 group">
          <button
            type="button"
            aria-label="Tutup jendela"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="win-btn btn-close flex h-3.25 w-3.25 cursor-pointer items-center justify-center rounded-full border border-black/25 bg-[#ff5f57] text-[0px] group-hover:after:content-['✕'] group-hover:after:text-[8px] group-hover:after:font-extrabold group-hover:after:text-black/70"
          />

          <button
            type="button"
            aria-label="Minimalkan jendela"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="win-btn btn-min flex h-3.25 w-3.25 cursor-pointer items-center justify-center rounded-full border border-black/25 bg-[#febc2e] text-[0px] group-hover:after:content-['−'] group-hover:after:text-[11px] group-hover:after:font-extrabold group-hover:after:text-black/70"
          />
        </div>

        {/* Window Title */}
        <div className="win-title flex flex-1 items-center justify-center gap-1.5 pr-13.5 text-center text-[0.8rem] font-semibold text-zinc-200">
          {windowState.title}
        </div>
      </div>

      {/* Window Body (Hitam Matte) */}
      <div className="win-body flex min-h-0 flex-1 flex-col overflow-hidden bg-[#121214] text-[#f5f5f7]">
        {children}
      </div>
    </div>
  );
};
