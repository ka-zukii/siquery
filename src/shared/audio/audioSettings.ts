// hooks/audioSettings.ts
import { useSyncExternalStore } from "react";

export interface AudioSettings {
  /** Pengali volume musik latar, 0..1 */
  bgm: number;
  /** Pengali volume efek suara, 0..1 */
  sfx: number;
}

const STORAGE_KEY = "siquery.audioSettings";
const DEFAULTS: AudioSettings = { bgm: 1, sfx: 1 };

const clamp = (n: unknown): number =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;

const load = (): AudioSettings => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return { bgm: clamp(parsed.bgm), sfx: clamp(parsed.sfx) };
  } catch {
    // Storage bisa diblokir atau rusak: pakai nilai default
    return DEFAULTS;
  }
};

let state: AudioSettings = load();
const listeners = new Set<() => void>();

export const getAudioSettings = (): AudioSettings => state;

export const setAudioSettings = (patch: Partial<AudioSettings>) => {
  state = {
    bgm: clamp(patch.bgm ?? state.bgm),
    sfx: clamp(patch.sfx ?? state.sfx),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Tidak apa-apa bila tidak bisa disimpan; pengaturan tetap berlaku
  }
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useAudioSettings = (): AudioSettings =>
  useSyncExternalStore(subscribe, getAudioSettings, getAudioSettings);
