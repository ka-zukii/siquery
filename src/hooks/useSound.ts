// hooks/useSound.ts
import { useCallback } from "react";

type SoundType = "click" | "open" | "close" | "error" | "success";

const SOUND_PATHS: Record<SoundType, string> = {
  click: "",
  open: "",
  close: "",
  error: "",
  success: "",
};

export const useSound = () => {
  const playSound = useCallback((type: SoundType) => {
    const audio = new Audio(SOUND_PATHS[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Autoplay blocked by browser policy until user interaction
    });
  }, []);

  return { playSound };
};
