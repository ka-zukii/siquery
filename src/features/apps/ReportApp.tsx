import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleExclamation,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import type { CaseReport } from "@/types/case.types";
import { useDb } from "@/shared/context/DatabaseContext";
import { useSound } from "@/shared/audio/useSound";

interface ReportAppProps {
  report?: CaseReport;
  caseTitle?: string;
}

const STAMP_GREEN = "#2f7d4f";

/* ------------------------------------------------------------------ */
/* Kartu pilihan                                                        */
/* ------------------------------------------------------------------ */

interface OptionCardProps {
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  label,
  selected,
  disabled,
  onSelect,
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={disabled}
    onClick={onSelect}
    className={`group flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left font-sans text-[0.85rem] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp disabled:cursor-default ${
      selected
        ? "border-ink bg-lamp/35 shadow-[inset_0_0_0_1px_#1d2420]"
        : "cursor-pointer border-ink/20 bg-white/40 hover:border-ink/50 hover:bg-white/70"
    }`}
  >
    <span
      aria-hidden="true"
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
        selected ? "border-ink bg-ink text-paper" : "border-ink/40"
      }`}
    >
      {selected && (
        <FontAwesomeIcon icon={faCheck} className="text-[0.55rem]" />
      )}
    </span>
    <span className="flex-1 leading-snug">{label}</span>
  </button>
);

/* ------------------------------------------------------------------ */
/* Komponen utama                                                       */
/* ------------------------------------------------------------------ */

export const ReportApp: React.FC<ReportAppProps> = ({ report, caseTitle }) => {
  const { solved, markSolved } = useDb();
  const { playSound } = useSound();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  if (!report) {
    return (
      <div className="flex h-full items-center justify-center bg-mac-solid p-6 text-center font-sans text-sm text-mac-muted">
        Belum ada laporan yang perlu dikirim untuk kasus ini.
      </div>
    );
  }

  const total = report.fields.length;
  const filled = report.fields.filter((f) => values[f.key]).length;

  const choose = (key: string, value: string) => {
    if (solved) return;
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = () => {
    if (solved) return;

    // Hanya bagian yang kosong yang ditandai. Jawaban yang salah tidak
    // ditunjuk satu per satu, supaya laporan tidak bisa diselesaikan dengan
    // mencoba-coba setiap pilihan.
    const newErrors: Record<string, string> = {};
    let missingCount = 0;
    let wrongCount = 0;
    for (const f of report.fields) {
      if (!values[f.key]) {
        newErrors[f.key] = "Pilih salah satu jawaban.";
        missingCount++;
      } else if (values[f.key] !== report.answer[f.key]) {
        wrongCount++;
      }
    }

    if (missingCount > 0 || wrongCount > 0) {
      setErrors(newErrors);
      setMessage(
        missingCount > 0
          ? "Masih ada bagian yang belum diisi."
          : "Ada jawaban yang belum tepat. Tinjau kembali buktimu sebelum mengirim lagi.",
      );
      playSound("error");
      return;
    }

    setErrors({});
    setMessage(null);
    markSolved();
    playSound("success");
  };

  return (
    <div className="h-full overflow-y-auto bg-mac-solid p-5">
      <article className="mx-auto max-w-140 rounded-md bg-paper p-6 text-ink shadow-[0_12px_30px_rgba(0,0,0,0.45)] ring-1 ring-ink/10">
        {/* Kop berkas */}
        <header className="relative mb-5 border-b-2 border-ink/80 pb-3">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/60">
            Formulir Laporan Penyelidikan
          </p>
          <h3 className="font-display text-2xl font-bold leading-tight">
            Laporan Akhir
          </h3>
          {caseTitle && (
            <p className="font-sans text-xs text-ink/75">{caseTitle}</p>
          )}
          <p className="mt-1 font-mono text-[0.68rem] text-ink/55">
            Kepada: head@library.univ.ac.id • Dari: detective@siquery.os
          </p>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 right-0 rotate-[-8deg] rounded border-2 border-[#a13b25]/70 px-2 py-0.5 font-mono text-[0.65rem] font-bold tracking-widest text-[#a13b25]/80"
          >
            RAHASIA
          </div>
        </header>

        {solved ? (
          /* Layar diterima */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div
              className="rotate-[-10deg] rounded-md border-[3px] border-double px-5 py-2 font-display text-3xl font-extrabold tracking-[0.15em] shadow-sm"
              style={{ borderColor: STAMP_GREEN, color: STAMP_GREEN }}
            >
              DITERIMA
            </div>
            <p className="max-w-[44ch] font-sans text-sm text-ink/85">
              {report.successMessage ?? "Kasus ini telah ditutup."}
            </p>

            <dl className="mt-2 grid w-full gap-2 border-t border-dashed border-ink/25 pt-4 text-left font-sans text-sm">
              {report.fields.map((f) => {
                const chosen = f.options.find((o) => o.value === values[f.key]);
                return (
                  <div key={f.key} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-ink/60">{f.label}</dt>
                    <dd className="flex items-center gap-1.5 font-semibold">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-[0.7rem]"
                        style={{ color: STAMP_GREEN }}
                      />
                      {chosen?.label ?? "-"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : (
          <>
            {/* Bilah kelengkapan */}
            <div className="mb-5">
              <div className="mb-1 flex justify-between font-mono text-[0.68rem] text-ink/60">
                <span>Kelengkapan</span>
                <span>
                  {filled}/{total}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-lamp transition-all duration-300"
                  style={{ width: `${(filled / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Pertanyaan */}
            <div className="space-y-4">
              {report.fields.map((field, idx) => {
                const err = errors[field.key];
                return (
                  <section
                    key={field.key}
                    aria-labelledby={`report-q-${field.key}`}
                    className={`rounded-md border border-dashed p-4 transition-colors ${
                      err ? "border-[#a13b25] bg-[#e0674f]/10" : "border-ink/25"
                    }`}
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-bold text-paper"
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h4
                          id={`report-q-${field.key}`}
                          className="font-sans text-sm font-semibold leading-snug"
                        >
                          {field.label}
                        </h4>
                        {field.hint && (
                          <p className="mt-0.5 font-sans text-xs italic text-ink/60">
                            {field.hint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      role="radiogroup"
                      aria-labelledby={`report-q-${field.key}`}
                      className="grid gap-2"
                    >
                      {field.options.map((o) => (
                        <OptionCard
                          key={o.value}
                          label={o.label}
                          selected={values[field.key] === o.value}
                          disabled={solved}
                          onSelect={() => choose(field.key, o.value)}
                        />
                      ))}
                    </div>

                    {err && (
                      <p className="mt-2 flex items-center gap-1.5 font-sans text-xs text-[#a13b25]">
                        <FontAwesomeIcon icon={faCircleExclamation} />
                        {err}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Tombol kirim */}
            <footer className="mt-5 flex items-center justify-between gap-3 border-t border-ink/20 pt-4">
              <p
                role="alert"
                className="min-h-5 font-sans text-xs text-[#a13b25]"
              >
                {message}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-lamp px-4 py-2 font-sans text-sm font-semibold text-[#1d1608] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors hover:bg-[#f6c765] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp active:translate-y-px"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                Kirim laporan
              </button>
            </footer>
          </>
        )}
      </article>
    </div>
  );
};
