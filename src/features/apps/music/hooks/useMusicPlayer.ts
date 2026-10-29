import { useEffect, useState } from "react";
import { useAudioSettings } from "@/shared/audio/audioSettings";
import {
  TRACKS,
  getAudio,
  getIndex,
  getRepeat,
  getShuffle,
  loadTrack,
  nextIndex,
  resumeAnalyser,
  setRepeatAll,
  setShuffle,
} from "@/shared/audio/player";
import { useTrackDurations } from "./useTrackDurations";

/** Semua state dan aksi pemutar. Komponen UI hanya membaca dan memanggil hasilnya. */
export const useMusicPlayer = () => {
  const audio = getAudio();
  const [idx, setIdx] = useState(getIndex);
  const [playing, setPlaying] = useState(!audio.paused);
  const [time, setTime] = useState(audio.currentTime || 0);
  const [duration, setDuration] = useState(
    Number.isFinite(audio.duration) ? audio.duration : 0,
  );
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(getRepeat);
  const [shuffle, setShuffleState] = useState(getShuffle);
  const bgmLevel = useAudioSettings().bgm;
  const durations = useTrackDurations();

  const track = TRACKS[idx];
  const accent = track.accent;
  const [gradFrom, gradTo] = track.gradient;

  // Lagu pertama dimuat saat aplikasi pertama kali dibuka
  useEffect(() => {
    if (!audio.getAttribute("src")) loadTrack(getIndex(), false);
  }, [audio]);

  // Ikuti kondisi audio selama aplikasi terbuka
  useEffect(() => {
    const onLoadStart = () => {
      setIdx(getIndex());
      setTime(0);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onPlayState = () => setPlaying(!audio.paused);
    const onTime = () => setTime(audio.currentTime);
    const onDuration = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("play", onPlayState);
    audio.addEventListener("pause", onPlayState);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDuration);
    return () => {
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("play", onPlayState);
      audio.removeEventListener("pause", onPlayState);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDuration);
    };
  }, [audio]);

  // Volume mengikuti slider aplikasi dan pengaturan musik latar
  useEffect(() => {
    audio.volume = muted ? 0 : volume * bgmLevel;
  }, [audio, volume, bgmLevel, muted]);

  const togglePlay = () => {
    if (audio.paused) {
      resumeAnalyser();
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const playTrack = (i: number) => loadTrack(i, true);

  const next = () => loadTrack(nextIndex(), !audio.paused);

  const prev = () => {
    // Lebih dari 3 detik: ulang dari awal. Kalau tidak: lagu sebelumnya.
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadTrack((getIndex() - 1 + TRACKS.length) % TRACKS.length, !audio.paused);
  };

  const seek = (v: number) => {
    audio.currentTime = v;
    setTime(v);
  };

  const toggleRepeat = () => {
    const v = !repeat;
    setRepeat(v);
    setRepeatAll(v);
  };

  const toggleShuffle = () => {
    const v = !shuffle;
    setShuffleState(v);
    setShuffle(v);
  };

  const toggleMute = () => setMuted((m) => !m);

  const changeVolume = (v: number) => {
    setVolume(v);
    setMuted(false);
  };

  // Antrean berikutnya (berurutan), dipakai di panel kanan
  const upNext = Array.from(
    { length: Math.min(4, TRACKS.length - 1) },
    (_, k) => TRACKS[(idx + 1 + k) % TRACKS.length],
  );

  return {
    tracks: TRACKS,
    idx,
    track,
    accent,
    gradFrom,
    gradTo,
    playing,
    time,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    durations,
    upNext,
    playTrack,
    togglePlay,
    next,
    prev,
    seek,
    toggleRepeat,
    toggleShuffle,
    toggleMute,
    changeVolume,
  };
};

export type MusicPlayer = ReturnType<typeof useMusicPlayer>;
