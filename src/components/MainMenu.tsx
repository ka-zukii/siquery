import React, { useState } from "react";
import type { CaseData } from "../types/case.types";

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  difficulty: string;
  description: string;
  isAvailable: boolean;
}

interface MainMenuProps {
  caseData: CaseData;
  onStartCase: () => void;
}

type ViewState = "main" | "chapters" | "howto" | "credits";

export const MainMenu: React.FC<MainMenuProps> = ({
  caseData,
  onStartCase,
}) => {
  const [currentView, setCurrentView] = useState<ViewState>("main");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const chapters: Chapter[] = [
    {
      id: "01-missing-manuscript",
      title: caseData.title,
      subtitle: "Chapter 01: The Missing Manuscript",
      date: caseData.date,
      location: "Perpustakaan Universitas",
      difficulty: "⭐⭐☆ (Dasar - Menengah)",
      description:
        "Manuskrip kuno abad ke-15 'Codex Nusantara' lenyap tanpa jejak kerusakan fisik dari Ruang Koleksi Khusus. Periksa barang bukti fisik dan telusuri database perpustakaan untuk mengungkap pelakunya.",
      isAvailable: true,
    },
    {
      id: "02-server-sabotage",
      title: "SiQuery: Server Room Sabotage",
      subtitle: "Chapter 02: Coming Soon",
      date: "Segera Hadir",
      location: "Pusat Data Universitas",
      difficulty: "⭐⭐⭐☆ (Menengah)",
      description:
        "Sistem penilaian akademik universitas lumpuh total akibat serangan siber pada tengah malam. Siapa orang dalam yang membocorkan kredensial server?",
      isAvailable: false,
    },
  ];

  const currentChapter = chapters[currentChapterIndex];

  const handlePrevChapter = () => {
    setCurrentChapterIndex(
      (prev) => (prev - 1 + chapters.length) % chapters.length,
    );
  };

  const handleNextChapter = () => {
    setCurrentChapterIndex((prev) => (prev + 1) % chapters.length);
  };

  const handlePlaySelected = () => {
    if (currentChapter.isAvailable) {
      onStartCase();
    } else {
      alert("Chapter ini masih dalam tahap pengembangan (Coming Soon)!");
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#020617] flex flex-col justify-between items-center p-10 overflow-hidden font-sans">
      {/* Background VFX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.25)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-size-[100%_4px] pointer-events-none z-10" />

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-212.5 flex flex-col items-center gap-8 my-auto">
        {/* Hero Header */}
        <div className="text-center">
          <span className="inline-block bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/35 px-3.5 py-1 rounded-full text-xs font-bold tracking-[2px]">
            DATABASE DETECTIVE SERIES
          </span>
          <h1 className="text-6xl font-black text-white my-2.5 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            SI<span className="text-[#0a84ff]">QUERY</span>
          </h1>
          <p className="text-[#94a3b8] text-base tracking-[3px] uppercase">
            The Art of SQL Investigation
          </p>
        </div>

        {/* VIEW 1: MAIN BUTTONS */}
        {currentView === "main" && (
          <div className="w-full flex justify-center transition-all duration-300">
            <div className="flex flex-col gap-3.5 w-full max-w-95">
              <button
                onClick={() => setCurrentView("chapters")}
                className="bg-linear-to-br from-[#0a84ff] to-[#0062d2] text-white border-none p-4 rounded-xl text-base font-bold tracking-wider cursor-pointer shadow-[0_10px_25px_rgba(10,132,255,0.35)] hover:-translate-y-1 hover:brightness-110 transition-all duration-200"
              >
                ▶ PLAY GAME
              </button>
              <button
                onClick={() => setCurrentView("howto")}
                className="bg-white/10 hover:bg-white/15 text-[#f8fafc] border border-white/15 hover:border-white/30 p-3.5 rounded-xl text-sm font-semibold tracking-wide cursor-pointer backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200"
              >
                HOW TO PLAY
              </button>
              <button
                onClick={() => setCurrentView("credits")}
                className="bg-white/10 hover:bg-white/15 text-[#f8fafc] border border-white/15 hover:border-white/30 p-3.5 rounded-xl text-sm font-semibold tracking-wide cursor-pointer backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200"
              >
                CREDITS
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: CHAPTER SLIDER */}
        {currentView === "chapters" && (
          <div className="w-full flex flex-col items-center transition-all duration-300">
            <div className="relative flex items-center gap-5 w-full max-w-180">
              <button
                onClick={handlePrevChapter}
                className="bg-white/10 hover:bg-[#0a84ff] border border-white/15 hover:border-[#0a84ff] text-white w-11.25 h-11.25 rounded-full text-lg cursor-pointer flex justify-center items-center transition-all duration-200 shrink-0 hover:scale-110"
              >
                ❮
              </button>

              <div className="flex-1 bg-[#0f172a]/75 border border-white/12 backdrop-blur-[30px] rounded-[18px] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-mac-open">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#818cf8] tracking-wider uppercase">
                    {currentChapter.subtitle}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      currentChapter.isAvailable
                        ? "bg-[#30d158]/20 text-[#30d158]"
                        : "bg-white/10 text-[#94a3b8]"
                    }`}
                  >
                    {currentChapter.isAvailable ? "TERSEDIA" : "SEGERA HADIR"}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {currentChapter.title}
                </h2>

                <div className="text-xs text-[#94a3b8] mb-3.5">
                  <span>📅 {currentChapter.date}</span> •{" "}
                  <span>📍 {currentChapter.location}</span> •{" "}
                  <span>⭐ {currentChapter.difficulty}</span>
                </div>

                <p className="text-sm text-[#cbd5e1] leading-relaxed mb-6">
                  {currentChapter.description}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentView("main")}
                    className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/15 p-3.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    ⬅ Kembali
                  </button>
                  <button
                    onClick={handlePlaySelected}
                    disabled={!currentChapter.isAvailable}
                    className={`flex-2 bg-linear-to-br from-[#0a84ff] to-[#0062d2] text-white border-none p-3.5 rounded-xl text-sm font-bold tracking-wider cursor-pointer shadow-lg hover:brightness-110 transition-all ${
                      !currentChapter.isAvailable
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    MULAI INVESTIGASI
                  </button>
                </div>
              </div>

              <button
                onClick={handleNextChapter}
                className="bg-white/10 hover:bg-[#0a84ff] border border-white/15 hover:border-[#0a84ff] text-white w-11.25 h-11.25 rounded-full text-lg cursor-pointer flex justify-center items-center transition-all duration-200 shrink-0 hover:scale-110"
              >
                ❯
              </button>
            </div>

            {/* Slider Dots */}
            <div className="flex justify-center gap-2 mt-7.5">
              {chapters.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentChapterIndex(idx)}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-200 ${
                    idx === currentChapterIndex
                      ? "w-6 bg-[#0a84ff]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: HOW TO PLAY */}
        {currentView === "howto" && (
          <div className="w-full max-w-170 bg-[#0f172a]/80 border border-white/12 backdrop-blur-[30px] rounded-[18px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-mac-open">
            <h2 className="text-2xl font-bold text-white mb-5 text-center">
              📘 Panduan Investigasi
            </h2>
            <div className="grid grid-cols-3 gap-3.5 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  1. Olah TKP Fisik
                </h3>
                <p className="text-xs text-[#94a3b8] leading-normal">
                  Klik barang bukti dan berkas di meja kerja untuk mencatat
                  petunjuk penting.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🖥️</div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  2. Akses Terminal SQL
                </h3>
                <p className="text-xs text-[#94a3b8] leading-normal">
                  Nyalakan PC, buka SiQuery DB Studio & UniMail untuk
                  menganalisis data tabel.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">⚖️</div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  3. Eksekusi Tuduhan
                </h3>
                <p className="text-xs text-[#94a3b8] leading-normal">
                  Kumpulkan ID pelaku, kartu akses, dan buku kunci untuk
                  menuntaskan kasus.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("main")}
              className="w-full bg-white/10 hover:bg-white/15 text-[#f8fafc] border border-white/15 p-3.5 rounded-xl text-sm font-semibold transition-all"
            >
              ⬅ Kembali
            </button>
          </div>
        )}

        {/* VIEW 4: CREDITS */}
        {currentView === "credits" && (
          <div className="w-full max-w-170 bg-[#0f172a]/80 border border-white/12 backdrop-blur-[30px] rounded-[18px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-mac-open">
            <h2 className="text-2xl font-bold text-white mb-5 text-center">
              👥 Tim Pengembang
            </h2>
            <div className="text-sm text-[#cbd5e1] leading-relaxed mb-6 text-center space-y-1">
              <p>
                <b>Studio:</b> Enuma Technology (2026)
              </p>
              <p>
                <b>Lead Programmer & Game Designer:</b> Rizky Andika Sukma
              </p>
              <p>
                <b>3D Artist & Environment:</b> Anang Setiaji
              </p>
              <p className="text-[#818cf8] text-xs font-mono mt-2.5">
                Built with Three.js, React, Tailwind CSS, SQLite WASM & Vite
              </p>
            </div>
            <button
              onClick={() => setCurrentView("main")}
              className="w-full bg-white/10 hover:bg-white/15 text-[#f8fafc] border border-white/15 p-3.5 rounded-xl text-sm font-semibold transition-all"
            >
              ⬅ Kembali
            </button>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <footer className="relative z-20 w-full flex justify-between text-[#64748b] text-xs font-mono">
        <span>SiQuery Engine v1.0 • React Ready</span>
        <span>Enuma Technology © 2026</span>
      </footer>
    </div>
  );
};
