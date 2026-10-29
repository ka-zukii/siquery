import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faPause,
  faPlay,
  faRepeat,
  faShuffle,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { MusicPlayer } from "@/features/apps/music/hooks/useMusicPlayer";
import { fmt } from "@/features/apps/music/utils/format";

const ctrlBtn =
  "grid place-items-center rounded-full transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2";

/** Posisi lagu, tombol kontrol, dan volume */
export const PlayerControls: React.FC<{ player: MusicPlayer }> = ({ player }) => {
  const {
    accent,
    playing,
    time,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    seek,
    prev,
    next,
    togglePlay,
    toggleRepeat,
    toggleShuffle,
    toggleMute,
    changeVolume,
  } = player;

  return (
    <div className="w-full max-w-md shrink-0 self-center @2xl:max-w-xl">
      {/* Posisi lagu */}
      <div className="flex items-center gap-3 font-mono text-[0.7rem] opacity-60">
        <span className="w-10 text-right">{fmt(time)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!duration}
          aria-label="Posisi lagu"
          className="flex-1"
          style={{ accentColor: accent }}
        />
        <span className="w-10">{fmt(duration)}</span>
      </div>

      {/* Tombol kontrol */}
      <div className="mt-2 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={toggleRepeat}
          aria-pressed={repeat}
          aria-label="Ulangi daftar"
          className={`${ctrlBtn} h-8 w-8 text-sm ${repeat ? "" : "opacity-40"}`}
          style={repeat ? { color: accent } : undefined}
        >
          <FontAwesomeIcon icon={faRepeat} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={prev}
          aria-label="Lagu sebelumnya"
          className={`${ctrlBtn} h-9 w-9`}
        >
          <FontAwesomeIcon icon={faBackwardStep} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Jeda" : "Putar"}
          className="grid h-11 w-11 place-items-center rounded-full text-white shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: accent }}
        >
          <FontAwesomeIcon
            icon={playing ? faPause : faPlay}
            aria-hidden="true"
            className={playing ? "" : "translate-x-px"}
          />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Lagu berikutnya"
          className={`${ctrlBtn} h-9 w-9`}
        >
          <FontAwesomeIcon icon={faForwardStep} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleShuffle}
          aria-pressed={shuffle}
          aria-label="Acak urutan"
          className={`${ctrlBtn} h-8 w-8 text-sm ${shuffle ? "" : "opacity-40"}`}
          style={shuffle ? { color: accent } : undefined}
        >
          <FontAwesomeIcon icon={faShuffle} aria-hidden="true" />
        </button>
      </div>

      {/* Volume */}
      <div className="mt-3 flex items-center justify-center gap-2 text-sm opacity-70">
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Bunyikan" : "Senyapkan"}
          className={`${ctrlBtn} h-7 w-7`}
        >
          <FontAwesomeIcon
            icon={muted || volume === 0 ? faVolumeXmark : faVolumeHigh}
            aria-hidden="true"
          />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          aria-label="Volume"
          className="w-40 @2xl:w-56"
          style={{ accentColor: accent }}
        />
      </div>
    </div>
  );
};
