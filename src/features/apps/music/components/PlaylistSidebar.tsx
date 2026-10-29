import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import type { MusicPlayer } from "@/features/apps/music/hooks/useMusicPlayer";
import { fmt } from "@/features/apps/music/utils/format";
import { EqBars } from "./EqBars";

/** Daftar putar di kolom kiri */
export const PlaylistSidebar: React.FC<{ player: MusicPlayer }> = ({ player }) => {
  const { tracks, idx, playing, durations, playTrack } = player;

  return (
    <aside className="flex flex-col gap-1 overflow-y-auto border-r border-mac-sep bg-mac-sidebar p-2">
      <p className="px-2 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-wider opacity-50">
        Perpustakaan
      </p>
      {tracks.map((t, i) => {
        const selected = i === idx;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => playTrack(i)}
            className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition ${
              selected ? "text-white" : "hover:bg-black/5"
            }`}
            style={selected ? { backgroundColor: t.accent } : undefined}
          >
            {selected ? (
              <EqBars active={playing} />
            ) : (
              <FontAwesomeIcon
                icon={faMusic}
                aria-hidden="true"
                className="w-3.5 text-[0.7rem] opacity-60"
              />
            )}
            <span className="min-w-0 flex-1 truncate text-[0.8rem] font-medium">
              {t.title}
            </span>
            <span className="font-mono text-[0.65rem] opacity-60">
              {durations[t.id] ? fmt(durations[t.id]) : ""}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
