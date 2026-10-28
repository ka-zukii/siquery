import React, { useEffect, useState } from "react";
import { DEMO_QUERIES, SQL_KEYWORDS } from "../data/demoQueries";

const Highlighted: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(SQL_KEYWORDS).map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="text-[#f0b84b]">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);

export const TerminalPreview: React.FC = () => {
  const [qi, setQi] = useState(0);
  const [typed, setTyped] = useState(0);
  const q = DEMO_QUERIES[qi];
  const done = typed >= q.sql.length;

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setTyped(q.sql.length);
      return;
    }
    if (!done) {
      const t = setTimeout(() => setTyped((n) => n + 1), 24);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setQi((i) => (i + 1) % DEMO_QUERIES.length);
      setTyped(0);
    }, 3400);
    return () => clearTimeout(t);
  }, [typed, qi, done, q.sql.length]);

  return (
    <div className="relative">
      {/* Bingkai monitor */}
      <div className="rounded-[22px] border border-[#2c3f37] bg-[#15231e] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between px-2 pb-2.5 pt-0.5">
          <span className="sq-sans text-[12px] font-medium text-[#8fa89d]">
            Sistem Perpustakaan Kampus
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="h-2 w-2 rounded-full bg-[#2c3f37]" />
            <i className="h-2 w-2 rounded-full bg-[#2c3f37]" />
            <i className="h-2 w-2 rounded-full bg-[#f0b84b]/80" />
          </span>
        </div>

        <div className="rounded-xl bg-[#08110e] p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)]">
          <p className="sq-sans mb-3 min-h-[2.5em] text-[12px] leading-snug text-[#7f9a8e]">
            {q.ticket}
          </p>

          <pre
            className="sq-mono min-h-30 whitespace-pre-wrap text-[13px] leading-relaxed text-[#9be8c9]"
            aria-label="Contoh kueri SQL"
          >
            <Highlighted text={q.sql.slice(0, typed)} />
            <span
              className={`ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.2em] bg-[#9be8c9] ${done ? "sq-caret" : ""}`}
            />
          </pre>

          <div
            className={`mt-3 min-h-23 rounded-lg border border-[#1f332b] bg-[#0c1a15] p-3 transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}
          >
            <table className="sq-mono w-full text-left text-[12px]">
              <thead>
                <tr className="text-[#6f8b7f]">
                  {q.cols.map((c) => (
                    <th key={c} className="pb-1.5 pr-4 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#d6efe4]">
                {q.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((cell, ci) => (
                      <td key={ci} className="pr-4 py-0.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="sq-sans mt-2 text-[11px] text-[#f0b84b]">
              Data cocok dengan target tiket
            </p>
          </div>
        </div>
      </div>

      {/* Dudukan monitor */}
      <div
        className="mx-auto h-3 w-24 rounded-b-md bg-[#15231e] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
        aria-hidden="true"
      />

      {/* Catatan tempel */}
      <div
        className="sq-sans absolute -bottom-6 -left-3 w-40 rotate-[-5deg] bg-[#f6d66a] p-3 text-[12px] leading-snug text-[#3b2f08] shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:-left-8"
        aria-hidden="true"
      >
        Password arsip: lihat catatan shift malam.
        <span className="mt-1 block text-[11px] opacity-70">— Bu Wati</span>
      </div>
    </div>
  );
};

