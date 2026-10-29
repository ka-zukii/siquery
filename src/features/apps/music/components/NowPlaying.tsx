import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import type { MusicPlayer } from "@/features/apps/music/hooks/useMusicPlayer";
import { BassGlow } from "@/features/apps/music/visuals/BassGlow";
import { DustMotes } from "@/features/apps/music/visuals/DustMotes";
import { SpectrumRing } from "@/features/apps/music/visuals/SpectrumRing";
import { TypedText } from "@/features/apps/music/visuals/TypedText";
import { PlayerControls } from "./PlayerControls";

/** Kolom tengah: artwork, judul, dan kontrol pemutar */
export const NowPlaying: React.FC<{ player: MusicPlayer }> = ({ player }) => {
  const { track, idx, tracks, gradFrom, gradTo } = player;

  return (
    <section className="relative isolate flex min-h-0 flex-col gap-3 overflow-hidden p-4 @2xl:p-6">
      {/* Latar berwarna mengikuti lagu, menyala sedikit mengikuti bass */}
      <BassGlow from={gradFrom} to={gradTo} />
      {/* Debu cahaya di bawah sorotan lampu arsip */}
      <DustMotes />

      {/* Nomor lagu */}
      <p className="shrink-0 text-center text-[0.68rem] font-semibold uppercase tracking-wider opacity-50">
        Sedang diputar · {idx + 1} dari {tracks.length}
      </p>

      {/* Artwork dengan spektrum: ikut membesar mengikuti ruang yang tersedia */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div
          className="relative grid aspect-square h-full max-h-112 min-h-16 place-items-center rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-[background] duration-700"
          style={{
            background: `linear-gradient(160deg, ${gradFrom} 0%, ${gradTo} 100%)`,
          }}
        >
          <SpectrumRing />
          <FontAwesomeIcon
            icon={faMusic}
            aria-hidden="true"
            className="text-[clamp(1.5rem,6vmin,4.5rem)] text-white/90"
          />
        </div>
      </div>

      {/* Judul lagu */}
      <div className="shrink-0 text-center">
        <TypedText
          key={track.id}
          text={track.title}
          className="truncate text-lg font-semibold @2xl:text-2xl"
        />
        <p className="truncate text-sm opacity-60">{track.artist}</p>
      </div>

      {/* Kontrol: selalu di bawah dan tidak ikut menyusut */}
      <PlayerControls player={player} />
    </section>
  );
};
