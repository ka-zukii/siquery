import { useCallback, useEffect, useRef, useState } from "react";
import type { DocContent, DocPage } from "@/features/desk-scene/types/desk-scene.types";
import { DISPLAY, MONO, SANS } from "@/features/desk-scene/desk-scene.helpers";
import { useSound } from "@/shared/audio/useSound";

interface Props {
  doc: DocContent;
  onClose: () => void;
}

const PAPER = "#efe6d0";
const INK = "#1d2420";
const GREEN = "#2f7a55";
const STAMP = "#2f7d4f";

const PAPER_TEXTURE = {
  backgroundColor: PAPER,
  backgroundImage:
    "radial-gradient(circle at 15% 10%, rgba(255,255,255,.5), transparent 45%), radial-gradient(circle at 88% 96%, rgba(110,80,30,.12), transparent 50%), repeating-linear-gradient(0deg, rgba(60,40,10,.03) 0 1px, transparent 1px 3px)",
};

const CSS = `
@keyframes sheet-in {
  from { opacity: 0; transform: translateY(26px) rotate(-1.3deg) scale(.97); }
  to   { opacity: 1; transform: none; }
}
.sheet-in { animation: sheet-in .5s cubic-bezier(.2,.8,.2,1) both; }
.sheet-track { transition: transform .38s cubic-bezier(.2,.8,.2,1); }
.sheet-track.is-dragging { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .sheet-in { animation: none; }
  .sheet-track { transition: none; }
}
`;

export const DocViewer = ({ doc, onClose }: Props) => {
  const pages: DocPage[] = [{ tag: "Ringkasan", title: doc.title, body: doc.body, kind: "briefing" }, ...(doc.pages ?? [])];
  const last = pages.length - 1;

  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  // menambahkan suara untuk slider petunjuk
  const { playSound } = useSound();

  // Tutup dokumen sambil memainkan suara klik
  const closeDoc = () => {
    playSound("click");
    onClose();
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(1);
  const startXRef = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(last, i));
      // Suara hanya saat halaman benar-benar berpindah
      if (next !== index) playSound("slide", { durationMs: 500 });
      setIndex(next);
    },
    [last, index, playSound],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  /* ---- Geser dengan jari / mouse ---- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    widthRef.current = cardRef.current?.clientWidth ?? 1;
    startXRef.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    let dx = e.clientX - startXRef.current;
    const atEdge = (index === 0 && dx > 0) || (index === last && dx < 0);
    if (atEdge) dx *= 0.3; // efek karet di ujung
    setDragX(dx);
  };

  const endDrag = () => {
    if (startXRef.current === null) return;
    startXRef.current = null;
    const threshold = widthRef.current * 0.2;
    if (dragX < -threshold) goTo(index + 1);
    else if (dragX > threshold) goTo(index - 1);
    setDragX(0);
    setDragging(false);
  };

  const progress = Math.min(1, Math.abs(dragX) / widthRef.current);
  const turningLeft = dragX < 0;

  const navBtn = "grid h-9 w-9 place-items-center rounded-full border text-[18px] transition disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 p-4 sm:p-6" onClick={onClose}>
      <style>{CSS}</style>

      <div ref={cardRef} className="sheet-in isolate relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Tumpukan kertas di belakang */}
        <div aria-hidden className="absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-[10px] bg-[#d9cca9] shadow-[0_10px_24px_rgba(0,0,0,0.35)]" />
        <div aria-hidden className="absolute inset-0 -z-10 translate-x-1 translate-y-1 rounded-[10px] bg-[#e4d8b9]" />

        <div role="dialog" aria-modal="true" aria-label={doc.title} style={PAPER_TEXTURE} className="relative overflow-hidden rounded-[10px] text-ink shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
          {/* Header kecil seperti label berkas */}
          <div className="flex items-center justify-between px-7 pt-5">
            <span style={{ fontFamily: SANS, color: INK }} className="text-[12px] font-bold uppercase tracking-[0.18em] opacity-60">
              Berkas kasus
            </span>
            {pages.length > 1 && (
              <span aria-live="polite" style={{ fontFamily: MONO, color: INK }} className="text-[12px] opacity-50">
                {index + 1} / {pages.length}
              </span>
            )}
          </div>

          {/* Area halaman */}
          <div className="relative mt-3 h-85 overflow-hidden sm:h-95" style={{ touchAction: "pan-y" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div
              className={`sheet-track flex h-full w-full ${dragging ? "is-dragging" : ""}`}
              style={{
                transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
              }}
            >
              {pages.map((p, i) => (
                <section key={i} aria-label={`Halaman ${i + 1} dari ${pages.length}`} className="flex h-full w-full shrink-0 flex-col px-7 pb-2 select-none">
                  <div className="flex-1 overflow-y-auto pr-1">
                    <p style={{ fontFamily: MONO, color: GREEN }} className="text-[12px] uppercase tracking-wider">
                      {p.tag}
                    </p>
                    <h3 style={{ fontFamily: DISPLAY, color: INK }} className="mt-2 text-[26px] font-bold leading-tight">
                      {p.title}
                    </h3>
                    <div className="my-4 border-t border-dashed border-ink/30" />
                    {p.stamp && (
                      <div
                        aria-hidden
                        className="mb-4 inline-block rotate-[-8deg] rounded-md border-[3px] border-double px-4 py-1 text-[26px] font-extrabold tracking-[0.15em]"
                        style={{
                          fontFamily: DISPLAY,
                          borderColor: STAMP,
                          color: STAMP,
                        }}
                      >
                        {p.stamp}
                      </div>
                    )}
                    <p style={{ fontFamily: SANS, color: "rgba(29,36,32,.9)" }} className="whitespace-pre-line text-[15px] leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </section>
              ))}
            </div>

            {/* Bayangan lipatan saat digeser */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-24"
              style={{
                opacity: dragging ? progress * 0.9 : 0,
                left: turningLeft ? "auto" : 0,
                right: turningLeft ? 0 : "auto",
                background: turningLeft ? "linear-gradient(to left, rgba(0,0,0,.22), transparent)" : "linear-gradient(to right, rgba(0,0,0,.22), transparent)",
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-dashed border-ink/30 px-7 py-4">
            <button
              onClick={closeDoc}
              style={{ fontFamily: SANS, backgroundColor: INK, color: PAPER }}
              className="rounded-xl px-5 py-2.5 text-[14px] font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Tutup
            </button>

            {pages.length > 1 && (
              <div className="flex items-center gap-3">
                <button aria-label="Halaman sebelumnya" className={`${navBtn} border-ink/25 text-ink hover:bg-ink/10`} disabled={index === 0} onClick={() => goTo(index - 1)}>
                  ‹
                </button>
                <div className="flex items-center gap-1.5">
                  {pages.map((_, i) => (
                    <button key={i} aria-label={`Ke halaman ${i + 1}`} aria-current={i === index} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-ink" : "w-2 bg-ink/25 hover:bg-ink/45"}`} />
                  ))}
                </div>
                <button aria-label="Halaman berikutnya" className={`${navBtn} border-ink/25[#1d2420] hover:bg-ink/10`} disabled={index === last} onClick={() => goTo(index + 1)}>
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
