import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faMusic,
  faPause,
  faPlay,
  faRepeat,
  faShuffle,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAudioSettings } from "../../../hooks/audioSettings";
import {
  TRACKS,
  getAnalyser,
  getAudio,
  getIndex,
  getRepeat,
  getShuffle,
  loadTrack,
  nextIndex,
  resumeAnalyser,
  setRepeatAll,
  setShuffle,
} from "../music/player";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

/** Durasi tiap lagu, dibaca sekali lewat metadata saja (tanpa mengunduh seluruh file) */
const useTrackDurations = () => {
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

/** Tiga batang kecil yang bergerak saat lagu diputar */
const EqBars: React.FC<{ active: boolean }> = ({ active }) => (
  <span aria-hidden="true" className="flex h-3 w-3.5 items-end gap-px">
    {[0, 0.25, 0.5].map((delay) => (
      <span
        key={delay}
        className="h-full w-0.5 origin-bottom rounded-full bg-current"
        style={{
          animation: "musicEq 0.9s ease-in-out infinite",
          animationDelay: `${delay}s`,
          animationPlayState: active ? "running" : "paused",
          transform: active ? undefined : "scaleY(0.35)",
        }}
      />
    ))}
  </span>
);

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

/** Pengguna yang minta gerakan dikurangi: animasi dimatikan */
const reduceMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Latar gradient yang sedikit menyala mengikuti hentakan bass */
const BassGlow: React.FC<{ from: string; to: string }> = ({ from, to }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;

    const analyser = getAnalyser();
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf = 0;
    let level = 0;

    const tick = () => {
      let target = 0;
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        // Empat bin pertama = frekuensi rendah (bass)
        let sum = 0;
        for (let i = 0; i < 4; i++) sum += data[i];
        target = sum / (4 * 255);
      }
      // Dihaluskan supaya tidak berkedip terlalu cepat
      level += (target - level) * 0.2;
      el.style.opacity = String(0.22 + level * 0.45);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
      style={{
        opacity: 0.3,
        background: `radial-gradient(120% 80% at 50% 0%, ${from} 0%, transparent 70%), radial-gradient(100% 70% at 50% 110%, ${to} 0%, transparent 70%)`,
      }}
    />
  );
};

type Mote = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  ph: number;
};

/** Debu cahaya yang melayang pelan di bawah sorotan lampu arsip */
const DustMotes: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g || reduceMotion()) return;

    const COUNT = 28;
    let motes: Mote[] = [];
    let raf = 0;
    let last = performance.now();

    const spawn = (w: number, h: number): Mote => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.012,
      vy: -(0.004 + Math.random() * 0.01),
      a: 0.3 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
    });

    const draw = (now: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        motes = Array.from({ length: COUNT }, () => spawn(w, h));
      }

      const dt = Math.min(64, now - last);
      last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#fff3d6";

      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.ph += dt * 0.001;
        if (m.y < -4) {
          m.y = h + 4;
          m.x = Math.random() * w;
        }
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;

        // Kelip pelan supaya tidak terlihat seperti titik statis
        g.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(m.ph * 2));
        g.beginPath();
        g.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Sorotan lampu dari atas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-5]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,240,200,0.14), transparent 70%)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-5] h-full w-full"
      />
    </>
  );
};

/** Judul yang diketik satu huruf demi satu saat lagu berganti */
const TypedText: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const [shown, setShown] = useState(() => (reduceMotion() ? text : ""));

  useEffect(() => {
    if (reduceMotion()) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 35);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </p>
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

  // Antrean berikutnya (berurutan), dipakai di panel kanan
  const upNext = Array.from(
    { length: Math.min(4, TRACKS.length - 1) },
    (_, k) => TRACKS[(idx + 1 + k) % TRACKS.length],
  );

  const ctrlBtn =
    "grid place-items-center rounded-full transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="@container h-full">
      <div className="grid h-full grid-cols-[200px_1fr] overflow-hidden bg-mac-solid font-sans @3xl:grid-cols-[200px_1fr_260px]">
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

        {/* Pemutar */}
        <section className="relative isolate flex min-h-0 flex-col gap-3 overflow-hidden p-4 @2xl:p-6">
          {/* Latar berwarna mengikuti lagu, menyala sedikit mengikuti bass */}
          <BassGlow from={gradFrom} to={gradTo} />
          {/* Debu cahaya di bawah sorotan lampu arsip */}
          <DustMotes />

          {/* Nomor lagu */}
          <p className="shrink-0 text-center text-[0.68rem] font-semibold uppercase tracking-wider opacity-50">
            Sedang diputar · {idx + 1} dari {TRACKS.length}
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
                onClick={() => setMuted((m) => !m)}
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
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setMuted(false);
                }}
                aria-label="Volume"
                className="w-40 @2xl:w-56"
                style={{ accentColor: accent }}
              />
            </div>
          </div>
        </section>

        {/* Panel samping: hanya muncul saat jendela cukup lebar */}
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
                      onClick={() => loadTrack(TRACKS.indexOf(t), true)}
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
      </div>
    </div>
  );
};
