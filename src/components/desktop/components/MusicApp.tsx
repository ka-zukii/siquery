import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faMusic,
  faPause,
  faPlay,
  faRepeat,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { useAudioSettings } from "../../../hooks/audioSettings";
import {
  TRACKS,
  getAnalyser,
  getAudio,
  getIndex,
  getRepeat,
  loadTrack,
  resumeAnalyser,
  setRepeatAll,
} from "../music/player";

const ACCENT = "#fa2d55";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

/** Batang spektrum melingkar di dalam kotak artwork */
const SpectrumRing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    const analyser = getAnalyser();
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const BARS = 48;
    let raf = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);

      if (analyser && data) analyser.getByteFrequencyData(data);

      const cx = w / 2;
      const cy = h / 2;
      const size = Math.min(w, h);
      const inner = size * 0.36;
      const maxLen = size * 0.14;

      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineCap = "round";
      g.lineWidth = Math.max(2, size * 0.02);

      for (let i = 0; i < BARS; i++) {
        // Memakai sebagian awal spektrum (frekuensi rendah) supaya lebih hidup
        const bin = data ? Math.floor((i / BARS) * data.length * 0.6) : 0;
        const v = data ? data[bin] / 255 : 0;
        const len = Math.max(2, v * maxLen);
        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        g.beginPath();
        g.moveTo(cx + cos * inner, cy + sin * inner);
        g.lineTo(cx + cos * (inner + len), cy + sin * (inner + len));
        g.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

export const MusicApp: React.FC = () => {
  const audio = getAudio();
  const [idx, setIdx] = useState(getIndex);
  const [playing, setPlaying] = useState(!audio.paused);
  const [time, setTime] = useState(audio.currentTime || 0);
  const [duration, setDuration] = useState(
    Number.isFinite(audio.duration) ? audio.duration : 0,
  );
  const [volume, setVolume] = useState(0.8);
  const [repeat, setRepeat] = useState(getRepeat);
  const bgmLevel = useAudioSettings().bgm;
  const track = TRACKS[idx];

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
    audio.volume = volume * bgmLevel;
  }, [audio, volume, bgmLevel]);

  const togglePlay = () => {
    if (audio.paused) {
      resumeAnalyser();
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const next = () => loadTrack((getIndex() + 1) % TRACKS.length, !audio.paused);

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

  const ctrlBtn =
    "grid place-items-center rounded-full transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="grid h-full grid-cols-[200px_1fr] overflow-hidden bg-mac-solid font-sans">
      {/* Daftar putar */}
      <aside className="flex flex-col gap-1 overflow-y-auto border-r border-mac-sep bg-mac-sidebar p-2">
        <p className="px-2 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-wider opacity-50">
          Perpustakaan
        </p>
        {TRACKS.map((t, i) => {
          const selected = i === idx;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => loadTrack(i, true)}
              className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition ${
                selected ? "text-white" : "hover:bg-black/5"
              }`}
              style={selected ? { backgroundColor: ACCENT } : undefined}
            >
              <FontAwesomeIcon
                icon={faMusic}
                aria-hidden="true"
                className="text-[0.7rem] opacity-80"
              />
              <span className="truncate text-[0.8rem] font-medium">
                {t.title}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Pemutar */}
      <section className="flex min-h-0 flex-col gap-3 overflow-hidden p-4">
        {/* Artwork dengan spektrum: menyusut mengikuti ruang yang tersedia */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative grid aspect-square h-full max-h-50 min-h-16 place-items-center rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            style={{
              background: "linear-gradient(160deg,#ff6b8b 0%,#5b1d3a 100%)",
            }}
          >
            <SpectrumRing />
            <FontAwesomeIcon
              icon={faMusic}
              aria-hidden="true"
              className="text-[clamp(1.5rem,5vmin,3.5rem)] text-white/90"
            />
          </div>
        </div>

        {/* Judul lagu */}
        <div className="shrink-0 text-center">
          <p className="truncate text-lg font-semibold">{track.title}</p>
          <p className="truncate text-sm opacity-60">{track.artist}</p>
        </div>

        {/* Kontrol: selalu di bawah dan tidak ikut menyusut */}
        <div className="w-full max-w-md shrink-0 self-center">
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
              style={{ accentColor: ACCENT }}
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
              style={repeat ? { color: ACCENT } : undefined}
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
              style={{ backgroundColor: ACCENT }}
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
            <span className="w-8" aria-hidden="true" />
          </div>

          {/* Volume */}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm opacity-70">
            <FontAwesomeIcon icon={faVolumeHigh} aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-40"
              style={{ accentColor: ACCENT }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
