import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface CoachStep {
  /** Nilai atribut data-tour pada elemen yang disorot */
  target: string;
  title: string;
  text: string;
}

interface CoachMarksProps {
  steps: CoachStep[];
  active: boolean;
  /** Dipanggil saat tur selesai atau dilewati */
  onDone: () => void;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CARD_W = 300;
const CARD_H_EST = 190;
const GAP = 14;
const PAD = 6;

const findEl = (target: string) =>
  document.querySelector<HTMLElement>(`[data-tour="${target}"]`);

const BTN_GHOST =
  "cursor-pointer rounded-md border border-paper/25 px-2.5 py-1 text-[0.74rem] text-paper hover:border-paper/55 hover:bg-paper/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";
const BTN_PRIMARY =
  "cursor-pointer rounded-md border-none bg-lamp px-3 py-1 text-[0.74rem] font-semibold text-[#1d1608] hover:bg-[#f6c765] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";

/**
 * Coach marks: menyorot elemen satu per satu dengan kartu penjelasan.
 * Langkah yang elemennya tidak ada di halaman dilewati otomatis.
 */
export const CoachMarks: React.FC<CoachMarksProps> = ({
  steps,
  active,
  onDone,
}) => {
  const [list, setList] = useState<CoachStep[]>([]);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Saat tur dimulai, ambil hanya langkah yang elemennya ada. Jendela bisa
  // baru dirender beberapa frame setelah dibuka, jadi pencarian diulang dulu.
  useEffect(() => {
    if (!active) return;
    let tries = 0;
    let raf = 0;
    const attempt = () => {
      const present = steps.filter((s) => findEl(s.target));
      if (present.length > 0) {
        setList(present);
        setIndex(0);
        (document.activeElement as HTMLElement | null)?.blur();
        return;
      }
      tries += 1;
      if (tries < 30) {
        raf = requestAnimationFrame(attempt);
      } else {
        doneRef.current();
      }
    };
    attempt();
    return () => cancelAnimationFrame(raf);
  }, [active, steps]);

  const current = list[index];
  const last = list.length - 1;

  // Ikuti posisi elemen yang disorot, termasuk saat jendela digeser
  useEffect(() => {
    if (!active || !current) return;
    let raf = 0;
    let previous = "";
    findEl(current.target)?.scrollIntoView({ block: "nearest", inline: "nearest" });
    const tick = () => {
      const el = findEl(current.target);
      if (el) {
        const r = el.getBoundingClientRect();
        const key = [r.top, r.left, r.width, r.height].join(",");
        if (key !== previous) {
          previous = key;
          setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, current]);

  const finish = () => {
    setList([]);
    setBox(null);
    doneRef.current();
  };
  const next = () => (index < last ? setIndex(index + 1) : finish());
  const prev = () => index > 0 && setIndex(index - 1);

  // Tombol keyboard dikunci selama tur, supaya tidak mengetik di editor
  useEffect(() => {
    if (!active || list.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") finish();
      else if (e.key === "Enter" || e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, list.length, index]);

  if (!active || !current) return null;

  let cardStyle: React.CSSProperties;
  if (box) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = box.top + box.height + GAP + CARD_H_EST < vh;
    const top = below
      ? box.top + box.height + GAP
      : Math.max(12, box.top - GAP - CARD_H_EST);
    const left = Math.min(Math.max(12, box.left), vw - CARD_W - 12);
    cardStyle = { top, left, width: CARD_W };
  } else {
    cardStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: CARD_W,
    };
  }

  return createPortal(
    <div
      className="fixed inset-0 z-300"
      role="dialog"
      aria-modal="true"
      aria-label="Tur SiQuery"
    >
      {/* Lapisan penutup: klik di luar sorotan tidak meneruskan ke aplikasi */}
      <div className="absolute inset-0" />

      {box && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-lg transition-all duration-300 ease-out"
          style={{
            top: box.top - PAD,
            left: box.left - PAD,
            width: box.width + PAD * 2,
            height: box.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(8, 6, 4, 0.72)",
            outline: "2px solid rgba(240, 184, 75, 0.9)",
          }}
        />
      )}

      <div
        className="absolute rounded-xl border border-paper/15 bg-panel-hi p-4 font-sans text-paper shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-[top,left] duration-300 ease-out"
        style={cardStyle}
      >
        <p className="text-[0.68rem] text-mac-muted">
          Langkah {index + 1} dari {list.length}
        </p>
        <h4 className="mt-1 text-[0.95rem] font-semibold text-lamp">
          {current.title}
        </h4>
        <p className="mt-1.5 text-[0.82rem] leading-snug text-paper/90">
          {current.text}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className={BTN_GHOST}>
            Lewati
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={prev} className={BTN_GHOST}>
                Kembali
              </button>
            )}
            <button type="button" onClick={next} className={BTN_PRIMARY}>
              {index === last ? "Selesai" : "Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
