import React from "react";
import { useMusicPlayer } from "./hooks/useMusicPlayer";
import { PlaylistSidebar } from "./components/PlaylistSidebar";
import { NowPlaying } from "./components/NowPlaying";
import { InfoPanel } from "./components/InfoPanel";

/** Aplikasi Music: layout tiga kolom. Logika ada di useMusicPlayer. */
export const MusicApp: React.FC = () => {
  const player = useMusicPlayer();

  return (
    <div className="@container h-full">
      <div className="grid h-full grid-cols-[200px_1fr] overflow-hidden bg-mac-solid font-sans @3xl:grid-cols-[200px_1fr_260px]">
        {/* Daftar putar */}
        <PlaylistSidebar player={player} />
        {/* Pemutar */}
        <NowPlaying player={player} />
        {/* Panel samping */}
        <InfoPanel player={player} />
      </div>
    </div>
  );
};
