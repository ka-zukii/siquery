import { useEffect, useState } from "react";
import { TRACKS } from "@/shared/audio/player";

/** Durasi tiap lagu, dibaca sekali lewat metadata saja (tanpa mengunduh seluruh file) */
export const useTrackDurations = () => {
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    const probes = TRACKS.map((t) => {
      const a = new Audio();
      a.preload = "metadata";
      a.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(a.duration)) {
          setDurations((d) => ({ ...d, [t.id]: a.duration }));
        }
      });
      a.src = t.src;
      return a;
    });
    return () => {
      probes.forEach((a) => {
        a.removeAttribute("src");
        a.load();
      });
    };
  }, []);

  return durations;
};
