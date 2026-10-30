import React, { useEffect, useRef, useState } from "react";
import { CASES, UPCOMING_CHAPTERS, caseToChapter } from "@/content/cases";
import {
  caseProgress,
  clearCaseProgress,
  isCaseSolved,
  readCompletedLessons,
} from "@/content/progress";
import type { CaseData } from "@/types/case.types";
import { DisplaySettingsPanel } from "./components/DisplaySettingsPanel";
import type { Chapter } from "./types";
import { TerminalPreview } from "./components/TerminalPreview";
import { CatalogCard } from "./components/CatalogCard";
import { FONT_IMPORT, LOCAL_CSS, FOCUS } from "./constants/styles";
import { useSound } from "@/shared/audio/useSound";
import { AudioSettingsPanel } from "./components/AudioSettingsPanel";
import { useButtonSound } from "@/shared/audio/useButtonSound";

/* ------------------------------------------------------------------ */
/* Tipe & data                                                         */
/* ------------------------------------------------------------------ */

interface MainMenuProps {
  onStartCase: (caseId: string) => void;
}

type ViewState = "main" | "chapters" | "howto" | "settings" | "credits";

const HELP_TIPS = [
  {
    t: "Pratinjau tabel",
    d: "Klik nama tabel di Skema database untuk melihat lima baris pertamanya, tanpa perlu menulis kueri.",
  },
  {
    t: "Pesan error yang jelas",
    d: "Kalau kueri gagal, pesannya dijelaskan dalam bahasa biasa, lengkap dengan saran nama kolom atau tabel yang mungkin dimaksud.",
  },
  {
    t: "Hitungan baris",
    d: "Jika jawabanmu belum tepat, terlihat berapa baris hasilmu dan berapa baris target. Dari situ kamu tahu apakah filternya terlalu longgar atau terlalu ketat.",
  },
  {
    t: "Menu di laptop",
    d: "Bilah di atas layar punya menu Ubah, Tampilan, Jendela, dan Bantuan. Panduan dan tur ulang ada di menu Bantuan.",
  },
];

const lessonsStarted = (c: CaseData) =>
  c.lessons?.length ? readCompletedLessons(c.id, c.lessons).length : 0;

/* ------------------------------------------------------------------ */
/* CSS lokal: font, kursor, dan penghormatan terhadap reduced motion    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Token warna (satu tempat supaya gampang diubah)                      */
/* ------------------------------------------------------------------ */
// meja   #0e1714  hijau tua gelap, warna meja kerja malam hari
// panel  #15231e  bingkai monitor & panel
// lampu  #f0b84b  cahaya lampu meja (aksen utama)
// kertas #efe6d0  kartu katalog / formulir
// tinta  #1d2420  teks di atas kertas
// fosfor #9be8c9  teks layar terminal

/* ------------------------------------------------------------------ */
/* Terminal demo yang mengetik sendiri                                  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Kartu katalog untuk slider chapter                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Komponen utama                                                       */
/* ------------------------------------------------------------------ */

export const MainMenu: React.FC<MainMenuProps> = ({ onStartCase }) => {
  const [currentView, setCurrentView] = useState<ViewState>("main");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const { playSound } = useSound();
  const prevChapterIndexRef = useRef(currentChapterIndex);

  // Belum ada kasus yang selesai: chapter 00 diberi label "Mulai di sini"
  const noneSolved = !CASES.some((c) => isCaseSolved(c.id));

  // Semua chapter diurutkan berdasarkan nomornya
  const chapters: Chapter[] = [
    ...CASES.map((c) => ({
      ...caseToChapter(c),
      progress: caseProgress(c),
      badge:
        c.meta.number === "00" && noneSolved && !isCaseSolved(c.id)
          ? "Mulai di sini"
          : undefined,
    })),
    ...UPCOMING_CHAPTERS,
  ].sort((a, b) => a.number.localeCompare(b.number));

  // Ringkasan progres: berapa kasus selesai dan kasus mana yang berikutnya
  const solvedCount = CASES.filter((c) => isCaseSolved(c.id)).length;
  const nextCase = CASES.find((c) => !isCaseSolved(c.id));
  // Kasus yang sedang dikerjakan (ada pelajaran selesai), atau kasus berikutnya
  const resumeCase =
    CASES.find((c) => !isCaseSolved(c.id) && lessonsStarted(c) > 0) ??
    (solvedCount > 0 ? nextCase : undefined);

  const total = chapters.length;
  const WINDOW_SIZE = 5;
  const windowStart = Math.max(0, Math.min(currentChapterIndex - 2, total - WINDOW_SIZE));
  const currentChapter = chapters[currentChapterIndex];

  const goPrev = () => setCurrentChapterIndex((i) => (i - 1 + total) % total);
  const goNext = () => setCurrentChapterIndex((i) => (i + 1) % total);

  // Main ulang harus dikonfirmasi dulu, karena progres akan direset
  const [confirmReplay, setConfirmReplay] = useState(false);
  useEffect(() => setConfirmReplay(false), [currentChapterIndex]);

  const handlePlaySelected = () => {
    if (!currentChapter.isAvailable) return;
    if (currentChapter.progress?.done && !confirmReplay) {
      setConfirmReplay(true);
      return;
    }
    if (currentChapter.progress?.done) clearCaseProgress(currentChapter.id);
    onStartCase(currentChapter.id);
  };

  // Navigasi keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentView !== "main") {
        setCurrentView("main");
        return;
      }
      if (currentView !== "chapters") return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, total]);

  // Bunyi slide setiap kartu katalog berpindah (tombol, panah keyboard,
  // tab nomor, atau klik kartu). Ref dipakai agar tidak berbunyi saat mount.
  useEffect(() => {
    if (prevChapterIndexRef.current === currentChapterIndex) return;
    prevChapterIndexRef.current = currentChapterIndex;
    playSound("slide", { durationMs: 500 });
  }, [currentChapterIndex]);

  const { hoverSound, clickThen } = useButtonSound();

  const primaryBtn = `sq-sans inline-flex items-center justify-center rounded-xl bg-[#f0b84b] px-6 py-3.5 text-[15px] font-semibold text-[#1d1608] shadow-[0_10px_30px_rgba(240,184,75,0.25)] transition hover:bg-[#f6c765] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-[#f0b84b] ${FOCUS}`;
  const ghostBtn = `sq-sans inline-flex items-center justify-center rounded-xl border border-[#efe6d0]/25 px-5 py-3.5 text-[15px] font-medium text-[#efe6d0] transition hover:border-[#efe6d0]/55 hover:bg-[#efe6d0]/5 ${FOCUS}`;

  const Wordmark = (
    <button onClick={() => setCurrentView("main")} className={`sq-display text-left text-2xl font-extrabold tracking-tight text-paper ${FOCUS} rounded`} aria-label="Kembali ke menu utama">
      SiQuery
      <span className="sq-sans ml-2 text-sm font-medium text-lamp">Campus Librarian</span>
    </button>
  );

  return (
    <div className="sq-sans relative min-h-screen w-full overflow-x-hidden bg-desk text-paper">
      <style>{FONT_IMPORT}</style>
      <style>{LOCAL_CSS}</style>

      {/* Cahaya lampu meja & bayangan tepi meja */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_12%_-8%,rgba(240,184,75,0.2),transparent_62%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_35%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        {/* ================= MAIN ================= */}
        {currentView === "main" && (
          <main className="my-auto grid items-center gap-14 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
            <section className="sq-rise">
              <h1 className="sq-display text-[4.25rem] font-extrabold leading-[0.95] tracking-tight text-paper sm:text-[5.5rem]">SiQuery</h1>
              <p className="sq-display mt-2 text-2xl font-medium text-lamp sm:text-3xl">Campus Librarian</p>
              <p className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-paper/80">Fokus ke layar. Periksa berkas di meja. Ketik kueri SQL untuk menyelesaikan tugas pustakawan.</p>

              <nav className="mt-9 flex max-w-sm flex-col gap-3" aria-label="Menu utama">
                {resumeCase && (
                  <button onClick={clickThen(() => onStartCase(resumeCase.id))} className={`${primaryBtn} justify-between text-left gap-2`} {...hoverSound}>
                    <span>Lanjutkan</span>
                    <span className="text-[13px] font-medium opacity-70">Kasus {resumeCase.meta.number}</span>
                  </button>
                )}
                <button onClick={clickThen(() => setCurrentView("chapters"))} className={`${resumeCase ? ghostBtn : primaryBtn} justify-between text-left gap-2`} {...hoverSound}>
                  <span>Mulai shift</span>
                  <span className="text-[13px] font-medium opacity-70">Pilih kasus</span>
                </button>
                <button onClick={clickThen(() => setCurrentView("howto"))} className={`${ghostBtn} justify-between text-left gap-2`} {...hoverSound}>
                  <span>Cara bermain</span>
                  <span className="text-[13px] opacity-60">4 langkah</span>
                </button>
                <button onClick={clickThen(() => setCurrentView("settings"))} className={`${ghostBtn} justify-between text-left gap-2`} {...hoverSound}>
                  <span>Pengaturan</span>
                  <span className="text-[13px] opacity-60">Suara dan tampilan</span>
                </button>
                <button onClick={clickThen(() => setCurrentView("credits"))} className={`${ghostBtn} justify-between text-left gap-2`} {...hoverSound}>
                  <span>Kredit</span>
                  <span className="text-[13px] opacity-60">Tim pembuat</span>
                </button>
              </nav>
            </section>

            <section className="sq-rise pb-8 lg:pl-4" style={{ animationDelay: "120ms" }}>
              <TerminalPreview />
            </section>
          </main>
        )}

        {/* ================= PILIH KASUS ================= */}
        {currentView === "chapters" && (
          <main className="my-auto flex flex-col gap-8 py-8">
            <header>{Wordmark}</header>

            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="sq-rise">
                <h2 className="sq-display text-4xl font-bold leading-tight text-paper">Pilih kasus dari laci katalog</h2>
                <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-paper/75">Setiap kartu adalah satu tumpukan tiket tugas. Geser dengan tombol panah atau tombol kiri dan kanan di keyboard.</p>
                <p className="sq-mono mt-5 text-[13px] text-paper/70">
                  Progres: {solvedCount} dari {CASES.length} kasus selesai
                </p>
                <p className="sq-sans mt-1 text-[14px] text-paper/60">
                  {nextCase
                    ? `Berikutnya: Kasus ${nextCase.meta.number} · ${nextCase.title}`
                    : "Semua kasus sudah selesai."}
                </p>

                <div className="mt-8">
                  <p className="sq-mono mb-3 text-[13px] text-paper/60">
                    Kasus {currentChapter.number} dari {total}
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={goPrev} aria-label="Kasus sebelumnya" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-paper/25 text-lg transition hover:border-lamp hover:text-lamp ${FOCUS}`}>
                      ‹
                    </button>

                    <div className="flex w-68 shrink-0 items-center justify-center gap-1.5" role="tablist" aria-label="Daftar kasus">
                      <span aria-hidden="true" className={`sq-mono w-4 text-center text-paper/40 ${windowStart > 0 ? "" : "invisible"}`}>
                        …
                      </span>

                      {chapters.slice(windowStart, windowStart + WINDOW_SIZE).map((c, i) => {
                        const idx = windowStart + i;
                        const active = idx === currentChapterIndex;
                        return (
                          <button
                            key={c.id}
                            role="tab"
                            aria-selected={active}
                            aria-label={`Kasus ${c.number}: ${c.title}`}
                            title={`${c.number} · ${c.title}`}
                            onClick={() => setCurrentChapterIndex(idx)}
                            className={`sq-mono flex h-9 w-10 shrink-0 items-center justify-center rounded-md text-[13px] transition ${FOCUS} ${
                              active ? "bg-paper font-medium text-ink" : "border border-paper/25 text-paper/70 hover:border-paper/60"
                            }`}
                          >
                            {c.number}
                          </button>
                        );
                      })}

                      <span aria-hidden="true" className={`sq-mono w-4 text-center text-paper/40 ${windowStart + WINDOW_SIZE < total ? "" : "invisible"}`}>
                        …
                      </span>
                    </div>

                    <button onClick={goNext} aria-label="Kasus berikutnya" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-paper/25 text-lg transition hover:border-lamp hover:text-lamp ${FOCUS}`}>
                      ›
                    </button>
                  </div>
                </div>

                {confirmReplay && currentChapter.progress?.done && (
                  <div
                    role="alertdialog"
                    aria-label="Konfirmasi main ulang"
                    className="sq-sans mt-6 max-w-sm rounded-xl border border-lamp/40 bg-desk/80 p-4 text-[14px] text-paper/90"
                  >
                    <p>
                      Progres kasus {currentChapter.number} akan direset dan
                      kasus dimulai dari awal. Lanjutkan?
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button onClick={() => setConfirmReplay(false)} className={`${ghostBtn} flex-1`}>
                        Batal
                      </button>
                      <button onClick={clickThen(handlePlaySelected)} className={`${primaryBtn} flex-1`}>
                        Ya, mulai ulang
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex max-w-sm gap-3">
                  <button onClick={clickThen(() => setCurrentView("main"))} className={`${ghostBtn} flex-1`} {...hoverSound}>
                    Kembali
                  </button>
                  <button onClick={clickThen(handlePlaySelected)} disabled={!currentChapter.isAvailable} className={`${primaryBtn} flex-[1.6]`} {...hoverSound}>
                    {currentChapter.isAvailable
                      ? currentChapter.progress?.done
                        ? "Main ulang"
                        : "Mulai investigasi"
                      : "Segera hadir"}
                  </button>
                </div>
              </div>

              {/* Tumpukan kartu katalog */}
              <div className="relative mx-auto h-116 w-full max-w-136 pb-8 pr-10 sm:h-108" aria-live="polite">
                <div className="relative h-full w-full">
                  {chapters.map((c, idx) => (
                    <CatalogCard key={c.id} chapter={c} offset={(idx - currentChapterIndex + total) % total} onFocusCard={() => setCurrentChapterIndex(idx)} />
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ================= CARA BERMAIN ================= */}
        {currentView === "howto" && (
          <main className="my-auto flex flex-col gap-8 py-8">
            <header>{Wordmark}</header>
            <div className="sq-rise rounded-[10px] bg-paper p-6 text-ink shadow-[0_24px_50px_rgba(0,0,0,0.5)] sm:p-9">
              <h2 className="sq-display text-3xl font-bold">Empat langkah menutup kasus</h2>
              <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    t: "Baca berkas",
                    d: "Klik berkas kasus di meja untuk membaca briefing. Geser halamannya untuk melihat barang bukti dan petunjuk.",
                  },
                  {
                    t: "Buka komputer",
                    d: "Klik layar macbook. DB Studio menampilkan tabel dan isinya, UniMail untuk surat masuk, dan Catatan untuk menulis dugaanmu.",
                  },
                  {
                    t: "Tulis kueri",
                    d: "Di Konsol SQL, tulis SELECT, JOIN, atau GROUP BY lalu tekan Jalankan kueri (Ctrl + Enter). Hasilnya harus sama dengan target tugas.",
                  },
                  {
                    t: "Tutup kasus",
                    d: "Kasus yang meminta hasil kueri selesai saat hasilnya cocok. Kasus yang meminta laporan selesai setelah kamu mengisi Laporkan lalu menekan Kirim laporan.",
                  },
                ].map((s, i) => (
                  <li key={s.t} className="rounded-lg border border-dashed border-ink/35 p-4">
                    <span className="sq-mono text-[12px] text-ink/55">Langkah {i + 1}</span>
                    <h3 className="sq-display mt-1 text-lg font-bold">{s.t}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{s.d}</p>
                  </li>
                ))}
              </ol>

              <h3 className="sq-display mt-9 border-t border-dashed border-ink/30 pt-7 text-2xl font-bold">Kalau bingung</h3>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {HELP_TIPS.map((h) => (
                  <li key={h.t} className="rounded-lg bg-ink/5 p-4">
                    <h4 className="sq-display text-base font-bold">{h.t}</h4>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink/80">{h.d}</p>
                  </li>
                ))}
              </ul>

              <button onClick={clickThen(() => setCurrentView("main"))} className={`mt-8 rounded-xl bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition hover:bg-[#2b352f] ${FOCUS}`}>
                Kembali ke menu
              </button>
            </div>
          </main>
        )}

        {/* ================= KREDIT ================= */}
        {currentView === "credits" && (
          <main className="my-auto flex flex-col gap-8 py-8">
            <header>{Wordmark}</header>
            <div className="sq-rise max-w-xl rounded-[10px] bg-paper p-7 text-ink shadow-[0_24px_50px_rgba(0,0,0,0.5)] sm:p-9">
              <h2 className="sq-display text-3xl font-bold">Tim pembuat</h2>
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-dashed border-ink/30 py-5 text-[15px]">
                <dt className="text-ink/55">Studio</dt>
                <dd className="font-medium">Enuma Technology (2026)</dd>
                <dt className="text-ink/55">Lead programmer dan game designer</dt>
                <dd className="font-medium">Rizky Andika Sukma</dd>
                <dt className="text-ink/55">3D artist dan environment</dt>
                <dd className="font-medium">Anang Setiaji</dd>
              </dl>
              <p className="sq-mono mt-5 text-[12px] text-ink/65">Three.js, React, Tailwind CSS, SQLite WASM, Vite</p>
              <button onClick={clickThen(() => setCurrentView("main"))} className={`mt-7 rounded-xl bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition hover:bg-[#2b352f] ${FOCUS}`}>
                Kembali ke menu
              </button>
            </div>
          </main>
        )}

        {/* ================= PENGATURAN ================= */}
        {currentView === "settings" && (
          <main className="my-auto flex flex-col gap-8 py-8">
            <header>{Wordmark}</header>
            <div className="flex flex-col gap-6">
              <DisplaySettingsPanel />
              <AudioSettingsPanel onBack={() => setCurrentView("main")} />
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="sq-mono mt-6 flex justify-between text-[11px] text-paper/40">
          <span>SiQuery Engine v1.0</span>
          <span>Enuma Technology © 2026</span>
        </footer>
      </div>
    </div>
  );
};
