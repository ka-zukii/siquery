// hooks/useBGM.ts
import { useEffect, useRef } from "react";
import { getAudioSettings, useAudioSettings } from "./audioSettings";

interface BgmOptions {
  /** Volume akhir 0..1 (sebelum dikali pengaturan pemain) */
  volume?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
}

/** Mengubah volume bertahap. Mengembalikan fungsi untuk membatalkan fade. */
const fade = (
  audio: HTMLAudioElement,
  to: number,
  ms: number,
  onDone?: () => void,
) => {
  const from = audio.volume;
  const start = performance.now();

  const timer = setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / ms);
    audio.volume = from + (to - from) * t;
    if (t >= 1) {
      clearInterval(timer);
      onDone?.();
    }
  }, 40);

  return () => clearInterval(timer);
};

/**
 * Musik latar yang berputar selama `active` bernilai true.
 * - Masuk dengan fade in, keluar dengan fade out lalu berhenti.
 * - Volume mengikuti pengaturan "Musik latar" dan langsung berubah saat digeser.
 * - Browser memblokir suara sebelum pemain berinteraksi dengan halaman,
 *   jadi bila pemutaran awal ditolak, musik dimulai pada klik atau
 *   tekan tombol pertama.
 */
export const useBgm = (
  src: string,
  active: boolean,
  { volume = 0.4, fadeInMs = 1500, fadeOutMs = 600 }: BgmOptions = {},
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Hanya dipakai untuk memicu render ulang saat slider berubah
  const bgmLevel = useAudioSettings().bgm;

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    let cancelled = false;
    let cancelFade = () => {};
    let removeUnlock = () => {};

    if (active) {
      const target = volume * getAudioSettings().bgm;

      const tryPlay = () =>
        audio.play().then(
          () => {
            if (cancelled) return false;
            cancelFade();
            cancelFade = fade(audio, target, fadeInMs);
            return true;
          },
          () => false,
        );

      tryPlay().then((ok) => {
        if (ok || cancelled) return;

        // Autoplay diblokir: coba lagi pada interaksi pertama
        const unlock = () => {
          removeUnlock();
          void tryPlay();
        };
        window.addEventListener("pointerdown", unlock);
        window.addEventListener("keydown", unlock);
        removeUnlock = () => {
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
        };
      });
    } else if (!audio.paused) {
      cancelFade = fade(audio, 0, fadeOutMs, () => audio.pause());
    }

    return () => {
      cancelled = true;
      cancelFade();
      removeUnlock();
    };
  }, [src, active, volume, fadeInMs, fadeOutMs]);

  // Ubah volume langsung saat slider digeser (musik sedang berputar)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.volume = volume * bgmLevel;
    }
  }, [bgmLevel, volume]);

  // Berhenti total saat komponen dilepas
  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );
};
