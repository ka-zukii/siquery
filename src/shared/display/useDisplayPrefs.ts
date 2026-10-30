import { useCallback, useEffect, useState } from "react";

export interface DisplayPrefs {
  reduceMotion: boolean;
  largeText: boolean;
}

export const DISPLAY_KEY = "siquery.display";

const DEFAULT_PREFS: DisplayPrefs = { reduceMotion: false, largeText: false };

export const readDisplayPrefs = (): DisplayPrefs => {
  try {
    const raw = localStorage.getItem(DISPLAY_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    // Data rusak atau penyimpanan tidak tersedia: pakai default
  }
  return DEFAULT_PREFS;
};

/** Menerapkan pengaturan ke halaman lewat class di <html> (lihat index.css) */
const applyToDocument = (p: DisplayPrefs) => {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", p.reduceMotion);
  root.classList.toggle("text-large", p.largeText);
};

/** Pengaturan tampilan yang dipakai bersama oleh menu utama dan laptop */
export const useDisplayPrefs = () => {
  const [prefs, setPrefs] = useState<DisplayPrefs>(readDisplayPrefs);

  useEffect(() => {
    applyToDocument(prefs);
    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify(prefs));
    } catch {
      // Penyimpanan tidak tersedia; pengaturan tetap berlaku di sesi ini
    }
  }, [prefs]);

  const update = useCallback(
    (patch: Partial<DisplayPrefs>) => setPrefs((p) => ({ ...p, ...patch })),
    [],
  );

  return { prefs, update };
};
