import React, { useEffect, useMemo, useState } from "react";
import { parseSchema } from "../utils/parseSchema";
import { useDb, type HistoryItem } from "../context/DatabaseContext";
import { SqlEditor } from "./SqlEditor";
import { describeFeedback } from "../utils/checkAnswer";
import {
  isTutorialDone,
  markTutorialDone,
  tutorialStep,
} from "./desktop/data/tutorial";
import type { CaseData, QueryResult } from "../types/case.types";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";

const HISTORY_LIMIT = 20;

type SchemaTable = ReturnType<typeof parseSchema>[number];

/** Membaca semua tabel yang ada di database saat ini, termasuk yang dibuat pemain */
const readLiveSchema = (
  run: (q: string) => QueryResult | null,
): SchemaTable[] => {
  const tables = run(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  if (!tables) return [];
  return tables.values.map((row) => {
    const name = String(row[0]);
    const info = run(`PRAGMA table_info(${name})`);
    return {
      name,
      cols: info ? info.values.map((r) => String(r[1])) : [],
    } as SchemaTable;
  });
};

export const SiQueryStudio: React.FC<{ caseData: CaseData }> = ({
  caseData,
}) => {
  const {
    isReady,
    isLoading,
    error: dbError,
    executeQuery,
    submitQuery,
    solved,
    feedback,
    sqlDraft,
    updateDraft,
  } = useDb();

  // Nama tabel bawaan chapter, untuk membedakan tabel yang dibuat pemain
  const baseNames = useMemo(
    () => new Set(parseSchema(caseData.schemaSql).map((t) => t.name)),
    [caseData.schemaSql],
  );

  // Skema dibaca dari database yang hidup, diperbarui setiap kali ada kueri baru
  const [liveSchema, setLiveSchema] = useState<SchemaTable[]>(() =>
    parseSchema(caseData.schemaSql),
  );

  // State editor dipegang context, jadi tetap ada saat keluar dari komputer
  const { query, result, localError, activeTable, history } = sqlDraft;
  const setQuery = (q: string) => updateDraft({ query: q });
  const setResult = (r: QueryResult | null) => updateDraft({ result: r });
  const setLocalError = (e: string | null) => updateDraft({ localError: e });
  const setActiveTable = (t: string | null) => updateDraft({ activeTable: t });

  // Panduan awal hanya untuk chapter pertama dan hanya sekali
  const [tutorialOpen, setTutorialOpen] = useState(
    () => caseData.meta.number === "01" && !isTutorialDone(),
  );
  const dismissTutorial = () => {
    markTutorialDone();
    setTutorialOpen(false);
  };

  useEffect(() => {
    if (!isReady) return;
    setLiveSchema(readLiveSchema(executeQuery));
  }, [isReady, history[0]?.id, executeQuery]);

  // Menjalankan kueri sekaligus mencatatnya ke riwayat
  const runAndRecord = (text: string) => {
    const res = submitQuery(text);
    const ok = Boolean(res) && !res?.error;
    const entry: HistoryItem = {
      id: Date.now(),
      query: text,
      ok,
      rows: res?.values.length ?? 0,
      at: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    updateDraft({ history: [entry, ...history].slice(0, HISTORY_LIMIT) });
    return res;
  };

  const handleRunQuery = () => {
    setLocalError(null);
    const res = runAndRecord(query);
    if (res) {
      setResult(res);
    }
  };

  const handleQuickSelect = (tableName: string) => {
    const defaultQuery = `SELECT * FROM ${tableName};`;
    setQuery(defaultQuery);
    setActiveTable(tableName);
    setLocalError(null);
    const res = runAndRecord(defaultQuery);
    if (res) {
      setResult(res);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isLoading && isReady) handleRunQuery();
    }
  };

  const activeError = localError || dbError;

  const ranQuery = history.length > 0;
  const ranOk = history.some((h) => h.ok);
  const step = tutorialOpen ? tutorialStep({ ranQuery, ranOk, solved }) : null;

  return (
    <div className="sql-app-layout grid h-full max-h-full grid-cols-[230px_1fr] overflow-hidden font-mono">
      {/* Sidebar skema dan riwayat */}
      <aside className="os-sidebar os-scroll max-h-full overflow-y-auto border-r border-paper/10 bg-mac-sidebar p-[12px_10px]">
        <h3 className="os-panel-title m-[2px_6px_8px] font-sans text-[0.72rem] font-semibold text-mac-muted">
          Skema database
        </h3>

        {liveSchema.map((tb) => {
          const isActive = activeTable === tb.name;
          return (
            <div
              key={`schema-${tb.name}`}
              className="os-schema-item mb-2.5 text-[0.78rem]"
            >
              <button
                type="button"
                onClick={() => handleQuickSelect(tb.name)}
                className={`os-table-name flex w-full cursor-pointer items-center gap-2 rounded-md p-[4px_8px] text-left transition-colors ${FOCUS} ${
                  isActive
                    ? "bg-lamp/15 text-lamp"
                    : "text-paper hover:bg-paper/8"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-sm ${isActive ? "bg-lamp" : "bg-paper/30"}`}
                  aria-hidden="true"
                />
                {tb.name}
                {!baseNames.has(tb.name) && (
                  <span className="ml-auto rounded bg-lamp/20 px-1.5 font-sans text-[0.6rem] font-semibold text-lamp">
                    baru
                  </span>
                )}
              </button>
              <ul className="os-col-list mt-1 ml-3.5 space-y-0.5 border-l border-paper/10 pl-3 text-[0.7rem] text-mac-muted">
                {tb.cols.map((col) => (
                  <li key={`col-${tb.name}-${col}`}>{col}</li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Riwayat kueri */}
        <div className="mt-4 border-t border-paper/10 pt-3">
          <div className="mb-2 flex items-center justify-between px-1.5">
            <h3 className="font-sans text-[0.72rem] font-semibold text-mac-muted">
              Riwayat kueri
            </h3>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => updateDraft({ history: [] })}
                className={`cursor-pointer rounded font-sans text-[0.68rem] text-mac-muted hover:text-paper ${FOCUS}`}
              >
                Hapus
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="px-1.5 font-sans text-[0.72rem] text-mac-muted">
              Belum ada kueri yang dijalankan.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setQuery(h.query)}
                    title={h.query}
                    className={`w-full cursor-pointer rounded-md p-[6px_8px] text-left transition-colors hover:bg-paper/8 ${FOCUS}`}
                  >
                    <span className="block truncate text-[0.72rem] text-paper/90">
                      {h.query}
                    </span>
                    <span
                      className={`mt-0.5 block font-sans text-[0.66rem] ${
                        h.ok ? "text-phosphor/80" : "text-[#f0a08f]"
                      }`}
                    >
                      {h.at} · {h.ok ? `${h.rows} baris` : "gagal"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Bagian utama */}
      <main className="os-main os-scroll flex h-full flex-col gap-3 overflow-y-auto bg-mac-solid p-3.5">
        <section className="os-editor-section os-scroll flex max-h-62.5 shrink-0 flex-col gap-2 overflow-y-auto">
          <div className="os-toolbar flex items-center justify-between font-sans text-[0.8rem] text-mac-muted">
            <span className="font-medium text-paper/85">Konsol SQL</span>
            <div className="os-toolbar-actions flex items-center gap-2">
              <span className="mr-1 hidden text-[0.7rem] text-mac-muted sm:inline">
                Ctrl + Enter untuk menjalankan
              </span>
              <button
                onClick={() => setQuery("")}
                className={`os-btn-secondary cursor-pointer rounded-md border border-paper/20 bg-transparent p-[5px_11px] font-sans text-[0.75rem] text-paper transition-colors hover:border-paper/50 hover:bg-paper/8 ${FOCUS}`}
              >
                Bersihkan
              </button>
              <button
                onClick={handleRunQuery}
                disabled={isLoading || !isReady}
                className={`os-btn-run cursor-pointer rounded-md border-none bg-lamp p-[5px_14px] font-sans text-[0.78rem] font-semibold text-[#1d1608] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors hover:bg-[#f6c765] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS} ${
                  step?.highlightRun
                    ? "ring-2 ring-lamp ring-offset-2 ring-offset-mac-solid animate-pulse"
                    : ""
                }`}
              >
                {isLoading ? "Memuat database..." : "Jalankan kueri"}
              </button>
            </div>
          </div>

          <SqlEditor
            id="sql-input"
            value={query}
            onChange={setQuery}
            onKeyDown={handleKeyDown}
            schema={liveSchema}
            placeholder="Ketik kueri SQL di sini..."
          />
        </section>

        {step && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-lamp/50 bg-lamp/12 p-[10px_12px] font-sans text-[0.8rem] text-paper">
            <p>
              <b>Panduan.</b> {step.text}
            </p>
            <button
              type="button"
              onClick={dismissTutorial}
              className={`shrink-0 cursor-pointer rounded-md border border-paper/25 px-2.5 py-1 text-[0.72rem] text-paper hover:border-paper/55 ${FOCUS}`}
            >
              Mengerti
            </button>
          </div>
        )}

        {caseData.hints.length > 0 && (
          <div className="os-hint-box rotate-[-0.4deg] rounded-sm bg-sticky p-[9px_12px] font-sans text-[0.78rem] leading-snug text-[#3b2f08] shadow-[0_6px_14px_rgba(0,0,0,0.35)]">
            <b>Petunjuk:</b> {caseData.hints[0]}
          </div>
        )}

        <section className="os-result-section flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {solved && (
            <div className="rounded-lg border border-[#28c840]/50 bg-[#28c840]/12 p-[10px_12px] font-sans text-[0.8rem] text-phosphor">
              <b>Tiket selesai.</b> Hasil kueri sesuai dengan target tugas.
            </div>
          )}

          {!solved && feedback && !activeError && (
            <div className="rounded-lg border border-lamp/50 bg-lamp/12 p-[10px_12px] font-sans text-[0.8rem] text-paper">
              <b>Belum tepat.</b> {describeFeedback(feedback)}
            </div>
          )}

          {activeError && (
            <div className="os-error rounded-lg border border-mac-red/50 bg-mac-red/12 p-[10px_12px] font-sans text-[0.8rem] text-[#f0a08f]">
              <b>Kueri gagal.</b> {activeError}
            </div>
          )}

          {!activeError && !result && (
            <div className="os-empty flex flex-1 items-center justify-center rounded-lg border border-dashed border-paper/15 p-4 text-center font-sans text-[0.82rem] text-mac-muted">
              Belum ada hasil. Pilih tabel di kiri atau jalankan kueri untuk
              melihat datanya.
            </div>
          )}

          {!activeError && result && (
            <>
              <div className="os-table-wrapper os-scroll max-h-full flex-1 overflow-auto rounded-lg border border-paper/12 bg-screen">
                {result.values.length === 0 ? (
                  <div className="os-empty p-3 font-sans text-[0.82rem] text-mac-muted">
                    Kueri berhasil dijalankan, tetapi datanya kosong.
                  </div>
                ) : (
                  <table className="os-table w-full border-collapse text-[0.8rem] whitespace-nowrap">
                    <thead>
                      <tr>
                        {result.columns.map((col: string, idx: number) => (
                          <th
                            key={`th-${col}-${idx}`}
                            className="sticky top-0 z-10 border-b border-paper/12 bg-panel-hi p-[7px_12px] text-left font-sans text-[0.72rem] font-semibold text-lamp"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.values.map((row, rIdx) => (
                        <tr
                          key={`tr-row-${rIdx}`}
                          className="even:bg-paper/3 hover:bg-lamp/12"
                        >
                          {row.map((val, cIdx) => (
                            <td
                              key={`td-cell-${rIdx}-${cIdx}`}
                              className="border-b border-paper/8 p-[7px_12px] text-left text-phosphor/90"
                            >
                              {val === null ? (
                                <i className="text-paper/30">NULL</i>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <p className="shrink-0 font-sans text-[0.72rem] text-mac-muted">
                {result.values.length} baris
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
};
