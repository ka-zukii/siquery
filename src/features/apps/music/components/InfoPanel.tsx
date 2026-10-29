import React from "react";
import type { MusicPlayer } from "@/features/apps/music/hooks/useMusicPlayer";
import { fmt } from "@/features/apps/music/utils/format";

/** Panel kanan: info lagu dan antrean berikutnya. Hanya muncul saat jendela cukup lebar. */
export const InfoPanel: React.FC<{ player: MusicPlayer }> = ({ player }) => {
  const { tracks, track, accent, shuffle, upNext, durations, playTrack } = player;

  return (
    <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto border-l border-mac-sep bg-mac-sidebar p-4 @3xl:flex">
      <div>
        <p className="pb-2 text-[0.68rem] font-semibold uppercase tracking-wider opacity-50">
          Tentang lagu ini
        </p>
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          {track.mood}
        </span>
        <p className="mt-2 text-[0.82rem] leading-relaxed opacity-70">
          {track.note}
        </p>
      </div>

      <div className="min-h-0">
        <p className="pb-2 text-[0.68rem] font-semibold uppercase tracking-wider opacity-50">
          Berikutnya{shuffle ? " · acak" : ""}
        </p>
        {shuffle ? (
          <p className="text-[0.8rem] opacity-60">
            Lagu berikutnya dipilih secara acak.
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {upNext.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => playTrack(tracks.indexOf(t))}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition hover:bg-black/5"
                >
                  <span
                    aria-hidden="true"
                    className="h-8 w-8 shrink-0 rounded-md"
                    style={{
                      background: `linear-gradient(160deg, ${t.gradient[0]}, ${t.gradient[1]})`,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8rem] font-medium">
                      {t.title}
                    </span>
                    <span className="block truncate text-[0.68rem] opacity-50">
                      {t.mood}
                    </span>
                  </span>
                  <span className="font-mono text-[0.65rem] opacity-50">
                    {durations[t.id] ? fmt(durations[t.id]) : ""}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
};
