import React, { useMemo, useState } from "react";
import { parseSchema } from "../utils/parseSchema";
import { useDb } from "../context/DatabaseContext";
import { SqlEditor } from "./SqlEditor";
import type { CaseData, QueryResult } from "../types/case.types";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";

export const SiQueryStudio: React.FC<{ caseData: CaseData }> = ({
  caseData,
}) => {
  // Ambil state dan fungsi query langsung dari context sistem
  const { isReady, isLoading, error: dbError, submitQuery, solved } = useDb();

  // Sidebar mengikuti skema chapter yang sedang dimainkan
  const schema = useMemo(
    () => parseSchema(caseData.schemaSql),
    [caseData.schemaSql],
  );

  const [query, setQuery] = useState(
    "SELECT * FROM access_logs WHERE status = 'GRANTED';",
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);

  const handleRunQuery = () => {
    setLocalError(null);
    const res = submitQuery(query);
    if (res) {
      setResult(res);
    }
  };

  const handleQuickSelect = (tableName: string) => {
    const defaultQuery = `SELECT * FROM ${tableName};`;
    setQuery(defaultQuery);
    setActiveTable(tableName);
    setLocalError(null);
    const res = submitQuery(defaultQuery);
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

  return (
    <div className="sql-app-layout grid h-full max-h-full grid-cols-[230px_1fr] overflow-hidden font-mono">
      {/* Sidebar skema */}
      <aside className="os-sidebar no-scrollbar max-h-full overflow-y-auto border-r border-paper/10 bg-mac-sidebar p-[12px_10px]">
        <h3 className="os-panel-title m-[2px_6px_8px] font-sans text-[0.72rem] font-semibold text-mac-muted">
          Skema database
        </h3>

        {schema.map((tb) => {
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
              </button>
              <ul className="os-col-list mt-1 ml-3.5 space-y-0.5 border-l border-paper/10 pl-3 text-[0.7rem] text-mac-muted">
                {tb.cols.map((col) => (
                  <li key={`col-${tb.name}-${col}`}>{col}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </aside>

      {/* Bagian utama */}
      <main className="os-main flex h-full flex-col gap-3 overflow-y-auto bg-mac-solid p-3.5">
        <section className="os-editor-section flex max-h-62.5 shrink-0 flex-col gap-2 overflow-y-auto">
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
                className={`os-btn-run cursor-pointer rounded-md border-none bg-lamp p-[5px_14px] font-sans text-[0.78rem] font-semibold text-[#1d1608] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors hover:bg-[#f6c765] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
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
            schema={schema}
            placeholder="Ketik kueri SQL di sini..."
          />
        </section>

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
              <div className="os-table-wrapper max-h-full flex-1 overflow-auto rounded-lg border border-paper/12 bg-screen">
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
