// hooks/useSound.ts
import { useCallback, useRef } from "react";
import { getAudioSettings } from "./audioSettings";

type SoundType = "click" | "open" | "close" | "error" | "success" | "slide";

// File ada di public/audio/effect/. BASE_URL menjaga path tetap benar
const SOUND_PATHS: Record<SoundType, string> = {
  click: "",
  open: "",
  close: "",
  error: "",
  success: "",
  slide: `${import.meta.env.BASE_URL}audio/effect/chapter_slide.mp3`,
};

const BASE_VOLUME = 0.5;
const FADE_MS = 150;

interface PlayOptions {
  /** Batasi durasi putar (ms), diakhiri fade out singkat */
  durationMs?: number;
}

export const useSound = () => {
  const audiosRef = useRef<Partial<Record<SoundType, HTMLAudioElement>>>({});
  const timersRef = useRef<Partial<Record<SoundType, number>>>({});

  const playSound = useCallback(
    (type: SoundType, { durationMs }: PlayOptions = {}) => {
      // Hentikan pemutaran sebelumnya dari jenis yang sama
      audiosRef.current[type]?.pause();
      window.clearTimeout(timersRef.current[type]);

      const audio = new Audio(SOUND_PATHS[type]);
      // Volume dibaca saat diputar, jadi perubahan slider langsung berlaku
      audio.volume = BASE_VOLUME * getAudioSettings().sfx;
      audiosRef.current[type] = audio;
      audio.play().catch(() => {
        // Autoplay blocked by browser policy until user interaction
      });

      if (durationMs) {
        const startVolume = audio.volume;
        timersRef.current[type] = window.setTimeout(() => {
          const steps = 6;
          let step = 0;
          const fadeId = window.setInterval(() => {
            step += 1;
            audio.volume = Math.max(0, startVolume * (1 - step / steps));
            if (step >= steps) {
              window.clearInterval(fadeId);
              audio.pause();
            }
          }, FADE_MS / steps);
        }, durationMs - FADE_MS);
      }
    },
    [],
  );

  return { playSound };
};
