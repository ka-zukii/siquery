import React, { useEffect, useState } from "react";
import { useDb } from "@/shared/context/DatabaseContext";
import {
  buildFeedback,
  describeFeedback,
  isSameOrderedResult,
  isSameResult,
  type QueryFeedback,
} from "@/shared/utils/checkAnswer";
import { revealedHintCount } from "@/shared/utils/hints";
import {
  readCompletedLessons,
  writeCompletedLessons,
} from "@/content/progress";
import type { Lesson, QueryResult } from "@/types/case.types";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";

interface LessonPanelProps {
  caseId: string;
  lessons: Lesson[];
  query: string;
  setQuery: (q: string) => void;
  /** Menjalankan kueri lewat Studio, sekaligus mencatat riwayat dan menampilkan hasil */
  runQuery: (text: string) => QueryResult | null;
}

export const LessonPanel: React.FC<LessonPanelProps> = ({
  caseId,
  lessons,
  query,
  setQuery,
  runQuery,
}) => {
  const { executeQuery, markSolved } = useDb();
  const [completed, setCompleted] = useState<string[]>(() =>
    readCompletedLessons(caseId, lessons),
  );
  // Pelajaran pertama yang belum selesai; -1 bila semuanya sudah selesai
  const index = lessons.findIndex((l) => !completed.includes(l.id));
  const [feedback, setFeedback] = useState<QueryFeedback | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Jawaban salah untuk pelajaran yang sedang dibuka, dipakai untuk petunjuk bertahap
  const [wrong, setWrong] = useState(0);

  const done = index === -1;
  const current = done ? undefined : lessons[index];
  const hints = current?.hints ?? [];
  const shownHints = revealedHintCount(wrong, hints.length);

  // Setelah pelajaran terakhir selesai, tiket ditandai selesai
  useEffect(() => {
    if (done) markSolved();
  }, [done, markSolved]);

  const handleCheck = () => {
    if (!current || !query.trim()) return;

    const res = runQuery(query);
    if (!res || res.error) {
      setFeedback(null);
      setMessage(null);
      return;
    }

    const expected = executeQuery(current.answerSql);
    if (!expected) return;

    const matches = current.ordered
      ? isSameOrderedResult(res, expected)
      : isSameResult(res, expected);

    if (matches) {
      const nextCompleted = [...completed, current.id];
      setCompleted(nextCompleted);
      writeCompletedLessons(caseId, nextCompleted);
      setWrong(0);
      setFeedback(null);
      setQuery("");
      setMessage(
        nextCompleted.length < lessons.length
          ? "Benar. Lanjut ke pelajaran berikutnya."
          : "Semua pelajaran selesai. Kamu siap bertugas.",
      );
    } else {
      setMessage(null);
      setWrong((n) => n + 1);
      const orderOnly = current.ordered && isSameResult(res, expected);
      setFeedback(orderOnly ? { kind: "order" } : buildFeedback(res, expected));
    }
  };

  return (
    <section
      data-tour="studio-lessons"
      className="rounded-lg border border-lamp/40 bg-lamp/8 p-3 font-sans text-[0.8rem] text-paper"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-lamp">Kelas latihan</h3>
        <span className="text-[0.72rem] text-mac-muted">
          {done ? lessons.length : index + 1} / {lessons.length}
        </span>
      </div>

      <div className="mb-3 flex gap-1.5" aria-hidden="true">
        {lessons.map((l, i) => (
          <span
            key={l.id}
            className={`h-1.5 flex-1 rounded-full ${
              completed.includes(l.id)
                ? "bg-phosphor"
                : i === index
                  ? "bg-lamp"
                  : "bg-paper/15"
            }`}
          />
        ))}
      </div>

      {done ? (
        <p>
          Semua pelajaran sudah selesai. Kamu sudah siap menangani tugas pertama
          di Meja Layanan.
        </p>
      ) : current ? (
        <>
          <p className="font-semibold">
            {index + 1}. {current.title}
          </p>
          <p className="mt-1 text-paper/85">{current.explanation}</p>

          <p className="mt-2 text-mac-muted">Contoh:</p>
          <pre className="os-scroll mt-1 overflow-x-auto rounded-md bg-screen p-2 font-mono text-[0.75rem] text-phosphor/90">
            <code>{current.exampleSql}</code>
          </pre>

          <p className="mt-2">
            <b>Tugas:</b> {current.prompt}
          </p>

          {shownHints > 0 && (
            <div className="mt-2 rounded-md border border-paper/15 bg-paper/5 p-2">
              <p className="font-semibold text-paper/90">
                Petunjuk {shownHints} dari {hints.length}
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-paper/85">
                {hints.slice(0, shownHints).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
              {shownHints < hints.length && (
                <p className="mt-1 text-[0.72rem] text-mac-muted">
                  Salah lagi untuk membuka petunjuk berikutnya.
                </p>
              )}
            </div>
          )}

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCheck}
              className={`cursor-pointer rounded-md border-none bg-lamp px-3.5 py-1.5 text-[0.78rem] font-semibold text-[#1d1608] transition-colors hover:bg-[#f6c765] active:translate-y-px ${FOCUS}`}
            >
              Periksa jawaban
            </button>
          </div>
        </>
      ) : null}

      {feedback && !done && (
        <p className="mt-2 rounded-md border border-lamp/40 bg-lamp/12 p-2">
          <b>Belum tepat.</b> {describeFeedback(feedback)}
        </p>
      )}
      {message && (
        <p className="mt-2 rounded-md border border-[#28c840]/50 bg-[#28c840]/12 p-2 text-phosphor">
          <b>{message}</b>
        </p>
      )}
    </section>
  );
};
