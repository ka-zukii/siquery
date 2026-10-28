// hooks/useWindowManager.ts
import { useState, useCallback } from "react";

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
}

export const useWindowManager = (
  initialWindows: Omit<WindowState, "isOpen" | "isMinimized" | "zIndex">[],
) => {
  const [windows, setWindows] = useState<Record<string, WindowState>>(() => {
    const initialState: Record<string, WindowState> = {};
    initialWindows.forEach((win, idx) => {
      initialState[win.id] = {
        ...win,
        isOpen: false,
        isMinimized: false,
        zIndex: 10 + idx,
      };
    });
    return initialState;
  });

  const [topZIndex, setTopZIndex] = useState(20);

  const openWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const target = prev[id];
        if (!target) return prev;
        const nextZ = topZIndex + 1;
        setTopZIndex(nextZ);
        return {
          ...prev,
          [id]: { ...target, isOpen: true, isMinimized: false, zIndex: nextZ },
        };
      });
    },
    [topZIndex],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target) return prev;
      return { ...prev, [id]: { ...target, isOpen: false } };
    });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target) return prev;
      return { ...prev, [id]: { ...target, isMinimized: true } };
    });
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const target = prev[id];
        if (!target || target.zIndex === topZIndex) return prev;
        const nextZ = topZIndex + 1;
        setTopZIndex(nextZ);
        return { ...prev, [id]: { ...target, zIndex: nextZ } };
      });
    },
    [topZIndex],
  );

  return { windows, openWindow, closeWindow, minimizeWindow, focusWindow };
};
