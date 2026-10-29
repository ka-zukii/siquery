import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import type { CaseData } from "@/types/case.types";
import { useDb } from "@/shared/context/DatabaseContext";
import { buildCheatSheet } from "@/content/cheatSheet";
import { GLOSSARY } from "@/content/glossary";
import { revealedHintCount } from "@/shared/utils/hints";

type Tab = "tugas" | "cara" | "sql" | "glosarium";

const TABS: { id: Tab; label: string }[] = [
  { id: "tugas", label: "Tugas" },
  { id: "cara", label: "Cara main" },
  { id: "sql", label: "Cheat SQL" },
  { id: "glosarium", label: "Glosarium" },
];

const CARA_MAIN = [
  {
    t: "Baca berkas",
    d: "Klik berkas kasus di meja untuk membaca briefing. Geser halamannya untuk melihat clue dan petunjuk.",
  },
  {
    t: "Buka komputer",
    d: "Klik layar macbook. DB Studio menampilkan tabel, UniMail untuk surat, Catatan untuk menulis dugaan, dan Laporkan untuk formulir.",
  },
  {
    t: "Tulis kueri",
    d: "Di Konsol SQL, tulis kueri lalu tekan Jalankan kueri atau Ctrl + Enter. Klik nama tabel di sidebar untuk melihat isinya.",
  },
  {
    t: "Tutup kasus",
    d: "Kasus kueri selesai saat hasilnya cocok. Kasus laporan selesai setelah formulir di Laporkan dikirim.",
  },
];

export const GuideApp: React.FC<{
  caseData: CaseData;
  /** Memutar ulang tur pengenalan dari awal */
  onReplayTour?: () => void;
}> = ({ caseData, onReplayTour }) => {
  const { sqlDraft, solved, wrongCount } = useDb();
  const [tab, setTab] = useState<Tab>("tugas");
  const cheat = useMemo(() => buildCheatSheet(caseData), [caseData]);

  const ranQuery = sqlDraft.history.some((h) => h.ok);
  const needsReport = Boolean(caseData.report);

  const tasks = [
    {
      done: ranQuery,
      text: "Jalankan kueri di DB Studio",
      note: "Tulis kueri di Konsol SQL lalu tekan Ctrl + Enter.",
    },
    needsReport
      ? {
          done: solved,
          text: "Kirim laporan di Laporkan",
          note: "Isi semua pertanyaan di formulir, lalu tekan Kirim laporan.",
        }
      : {
          done: solved,
          text: "Hasil kueri cocok dengan target",
          note: "Kueri yang benar akan menutup tiket secara otomatis.",
        },
  ];

  const status = solved
    ? "Tiket sudah selesai."
    : needsReport
      ? "Kasus ini diselesaikan lewat formulir Laporkan. Kueri yang benar saja belum menutup tiket."
      : "Kasus ini selesai saat hasil kueri cocok dengan target tugas.";

  return (
    <div className="flex h-full flex-col bg-mac-solid font-sans">
      {/* Tab */}
      <div className="flex shrink-0 gap-1 border-b border-mac-sep bg-mac-sidebar p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`rounded-md px-3 py-1.5 text-[0.8rem] transition ${
              tab === t.id
                ? "bg-black/10 font-semibold"
                : "opacity-60 hover:bg-black/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="os-scroll min-h-0 flex-1 overflow-y-auto p-5">
        {tab === "tugas" && (
          <div className="space-y-5">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider opacity-50">
                Chapter {caseData.meta.number}
              </p>
              <h3 className="font-display mt-1 text-xl font-bold">
                {caseData.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                {caseData.briefing}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Langkah</p>
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li
                    key={t.text}
                    className="flex gap-3 rounded-lg border border-black/10 p-3"
                  >
                    <FontAwesomeIcon
                      icon={t.done ? faCircleCheck : faCircle}
                      aria-hidden="true"
                      className={`mt-0.5 shrink-0 ${t.done ? "text-[#28c840]" : "opacity-30"}`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${t.done ? "line-through opacity-60" : ""}`}
                      >
                        {t.text}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] opacity-60">
                        {t.note}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-black/5 p-3 text-[0.8rem]">
                {status}
              </p>
            </div>

            {caseData.hints.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Petunjuk</p>
                {caseData.lessons ? (
                  <p className="text-sm opacity-80">
                    Petunjuk setiap pelajaran ada di panel Kelas latihan.
                  </p>
                ) : (
                  <>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm opacity-90">
                      {caseData.hints
                        .slice(
                          0,
                          revealedHintCount(wrongCount, caseData.hints.length),
                        )
                        .map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                    </ul>
                    {revealedHintCount(wrongCount, caseData.hints.length) <
                      caseData.hints.length && (
                      <p className="mt-2 text-[0.75rem] opacity-60">
                        Salah lagi untuk membuka petunjuk berikutnya.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "cara" && (
          <ol className="space-y-4">
            {CARA_MAIN.map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="font-mono text-[0.75rem] opacity-50">
                  {i + 1}.
                </span>
                <div>
                  <p className="font-semibold">{s.t}</p>
                  <p className="mt-0.5 text-sm leading-relaxed opacity-80">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {tab === "cara" && onReplayTour && (
          <div className="mt-6 rounded-lg border border-black/10 p-3">
            <p className="text-sm font-semibold">Tur pengenalan</p>
            <p className="mt-0.5 text-[0.78rem] opacity-70">
              Ulangi penjelasan tampilan meja dan DB Studio dari awal.
            </p>
            <button
              type="button"
              onClick={onReplayTour}
              className="mt-2 rounded-md bg-black/10 px-3 py-1.5 text-[0.8rem] font-semibold hover:bg-black/15"
            >
              Putar ulang tur
            </button>
          </div>
        )}

        {tab === "sql" && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold">Konsep di kasus ini</p>
              <div className="flex flex-wrap gap-1.5">
                {caseData.meta.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-black/10 px-2.5 py-0.5 font-mono text-[0.72rem]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Tabel di kasus ini</p>
              {cheat.tables.length === 0 ? (
                <p className="text-sm opacity-60">Belum ada tabel.</p>
              ) : (
                <ul className="space-y-1.5">
                  {cheat.tables.map((t) => (
                    <li key={t.name} className="rounded-md bg-black/5 p-2">
                      <p className="font-mono text-[0.78rem] font-semibold">
                        {t.name}
                      </p>
                      <p className="font-mono text-[0.7rem] opacity-60">
                        {t.cols.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              {cheat.entries.length === 0 ? (
                <p className="text-sm opacity-60">
                  Belum ada contoh untuk konsep kasus ini.
                </p>
              ) : (
                cheat.entries.map((e) => (
                  <div key={e.skill}>
                    <p className="text-sm font-semibold">{e.judul}</p>
                    <pre className="mt-1.5 overflow-x-auto rounded-md bg-ink p-3 font-mono text-[0.75rem] leading-relaxed text-phosphor">
                      {e.kode}
                    </pre>
                  </div>
                ))
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">{cheat.contekan.judul}</p>
              <pre className="mt-1.5 overflow-x-auto rounded-md bg-ink p-3 font-mono text-[0.75rem] leading-relaxed text-phosphor">
                {cheat.contekan.kode}
              </pre>
            </div>

            <p className="text-[0.72rem] opacity-50">
              Contoh memakai nama tabel kasus ini. Ganti kondisi sesuai
              petunjuk.
            </p>
          </div>
        )}
        {tab === "glosarium" && (
          <dl className="space-y-3">
            {GLOSSARY.map((g) => (
              <div key={g.istilah} className="rounded-lg border border-black/10 p-3">
                <dt className="font-mono text-[0.85rem] font-semibold">
                  {g.istilah}
                </dt>
                <dd className="mt-1 text-sm opacity-85">{g.arti}</dd>
                <dd className="mt-1.5 font-mono text-[0.72rem] opacity-60">
                  {g.contoh}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
};
