import { useEffect } from "react";
import type { CaseData } from "@/types/case.types";
import { DISPLAY, MONO, SANS } from "@/features/desk-scene/desk-scene.helpers";

interface Props {
  caseData: CaseData;
  onClose: () => void;
  onChooseChapter: () => void;
}

const STAMP = "#2f7d4f";
const INK = "#1d2420";
const PAPER = "#efe6d0";

const CSS = `
@keyframes notice-in {
  from { opacity: 0; transform: translateY(18px) scale(.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes stamp-slam {
  0%   { opacity: 0; transform: rotate(-10deg) scale(1.9); }
  60%  { opacity: 1; transform: rotate(-10deg) scale(.92); }
  100% { opacity: 1; transform: rotate(-10deg) scale(1); }
}
@keyframes ring-pulse {
  0%   { transform: scale(.6); opacity: .7; }
  100% { transform: scale(2.3); opacity: 0; }
}
.notice-in  { animation: notice-in .45s cubic-bezier(.2,.8,.2,1) both; }
.stamp-slam { animation: stamp-slam .5s cubic-bezier(.2,.8,.2,1) .35s both; }
.ring-pulse { animation: ring-pulse 1.4s ease-out .6s 2 both; }
@media (prefers-reduced-motion: reduce) {
  .notice-in, .stamp-slam, .ring-pulse { animation: none; }
}
`;

export const SolvedNotice = ({ caseData, onClose, onChooseChapter }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isLatihan = Boolean(caseData.lessons);
  const hasReport = Boolean(caseData.report);
  const stampText = isLatihan
    ? "LATIHAN SELESAI"
    : hasReport
      ? "DITERIMA"
      : "TERPECAHKAN";
  const message = isLatihan
    ? "Semua pelajaran latihan sudah selesai. Kamu siap menangani kasus pertama."
    : (caseData.report?.successMessage ??
      "Hasil kueri sudah sesuai dengan target tugas.");

  return (
    <div
      className="absolute inset-0 z-200 flex items-center justify-center bg-black/70 p-4 sm:p-6"
      onClick={onClose}
    >
      <style>{CSS}</style>

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="solved-title"
        onClick={(e) => e.stopPropagation()}
        className="notice-in relative w-full max-w-md overflow-hidden rounded-xl px-7 pb-6 pt-7 text-center shadow-[0_30px_70px_rgba(0,0,0,.65)]"
        style={{
          backgroundColor: PAPER,
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(255,255,255,.5), transparent 50%)",
        }}
      >
        <p
          style={{ fontFamily: MONO, color: STAMP }}
          className="text-[12px] uppercase tracking-[0.2em]"
        >
          Chapter {caseData.meta.number} · Selesai
        </p>

        <div className="relative my-5 flex h-40 items-center justify-center">
          <span
            aria-hidden
            className="ring-pulse pointer-events-none absolute inset-0 m-auto h-40 w-40 rounded-full border-2"
            style={{ borderColor: STAMP }}
          />
          <div
            aria-hidden
            className="stamp-slam whitespace-nowrap rounded-md border-4 border-double pl-[calc(1.25rem+0.15em)] pr-5 py-2 text-[34px] font-extrabold tracking-[0.15em]"
            style={{ fontFamily: DISPLAY, borderColor: STAMP, color: STAMP }}
          >
            {stampText}
          </div>
        </div>

        <h2
          id="solved-title"
          style={{ fontFamily: DISPLAY, color: INK }}
          className="text-[28px] font-bold leading-tight"
        >
          Kasus terpecahkan
        </h2>
        <p
          style={{ fontFamily: SANS, color: INK }}
          className="mt-1 text-[14px] opacity-70"
        >
          {caseData.title}
        </p>
        <p
          style={{ fontFamily: SANS, color: INK }}
          className="mx-auto mt-4 max-w-[38ch] text-[15px] leading-relaxed opacity-90"
        >
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            onClick={onChooseChapter}
            style={{ fontFamily: SANS, backgroundColor: INK, color: PAPER }}
            className="rounded-xl px-5 py-3 text-[14px] font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Pilih chapter
          </button>
          <button
            onClick={onClose}
            style={{
              fontFamily: SANS,
              color: INK,
              borderColor: "rgba(29,36,32,.3)",
            }}
            className="rounded-xl border px-5 py-3 text-[14px] font-semibold transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Tetap di meja
          </button>
        </div>
      </div>
    </div>
  );
};
