import React, { useState } from "react";
import { useDb } from "../context/DatabaseContext";
import type { CaseData, QueryResult } from "../types/case.types";

const TABLES_SCHEMA = [
  {
    name: "members",
    cols: [
      "member_id",
      "full_name",
      "role",
      "department",
      "card_id",
      "physical_note",
    ],
  },
  { name: "books", cols: ["book_id", "title", "category", "location"] },
  {
    name: "borrowing_records",
    cols: ["record_id", "member_id", "book_id", "borrow_date", "return_date"],
  },
  {
    name: "access_logs",
    cols: [
      "log_id",
      "card_id",
      "room_name",
      "access_date",
      "entry_time",
      "exit_time",
      "status",
    ],
  },
  {
    name: "security_reports",
    cols: [
      "report_id",
      "member_id",
      "report_date",
      "report_time",
      "description",
    ],
  },
];

export const SiQueryStudio: React.FC<{ caseData: CaseData }> = ({
  caseData,
}) => {
  // Ambil state dan fungsi query langsung dari context sistem
  const { isReady, isLoading, error: dbError, executeQuery } = useDb();

  const [query, setQuery] = useState(
    "SELECT * FROM access_logs WHERE status = 'GRANTED';",
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRunQuery = () => {
    setLocalError(null);
    const res = executeQuery(query);
    if (res) {
      setResult(res);
    }
  };

  const handleQuickSelect = (tableName: string) => {
    const defaultQuery = `SELECT * FROM ${tableName};`;
    setQuery(defaultQuery);
    setLocalError(null);
    const res = executeQuery(defaultQuery);
    if (res) {
      setResult(res);
    }
  };

  const activeError = localError || dbError;

  return (
    <div className="sql-app-layout grid grid-cols-[240px_1fr] h-full max-h-full font-mono overflow-hidden">
      {/* Sidebar */}
      <aside className="os-sidebar border-r border-white/8 p-[12px_10px] overflow-y-auto bg-[rgba(40,40,44,0.72)] max-h-full no-scrollbar">
        <h3 className="os-panel-title text-[#a1a1a6] font-sans font-semibold text-[0.68rem] uppercase tracking-[0.6px] m-[2px_6px_8px]">
          DATABASE SCHEMAS
        </h3>

        {TABLES_SCHEMA.map((tb) => (
          <div
            key={`schema-${tb.name}`}
            className="os-schema-item mb-2.5 text-[0.78rem]"
          >
            <span
              onClick={() => handleQuickSelect(tb.name)}
              className="os-table-name text-[#f5f5f7] cursor-pointer p-[4px_8px] rounded-md transition-colors hover:bg-white/10 active:bg-[#0a84ff] block"
            >
              📄 {tb.name}
            </span>
            <ul className="os-col-list list-none pl-4.5 text-[#a1a1a6] text-[0.7rem] mt-0.75 space-y-0.5">
              {tb.cols.map((col) => (
                <li key={`col-${tb.name}-${col}`}>{col}</li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* Main Section */}
      <main className="os-main flex flex-col p-3.5 gap-3 overflow-y-auto h-full bg-[#121214]">
        <section className="os-editor-section shrink-0 flex flex-col gap-2 max-h-62.5 overflow-y-auto">
          <div className="os-toolbar flex justify-between items-center font-sans text-[0.8rem] text-[#a1a1a6]">
            <span>SQL Console Editor</span>
            <div className="os-toolbar-actions flex gap-2">
              <button
                onClick={() => setQuery("")}
                className="os-btn-secondary bg-white/10 text-[#f5f5f7] border border-white/10 p-[5px_11px] rounded-md font-sans cursor-pointer text-[0.75rem] hover:bg-white/18 transition-all"
              >
                Clear
              </button>
              <button
                onClick={handleRunQuery}
                disabled={isLoading || !isReady}
                className="os-btn-run bg-[#0a84ff] text-white border-none p-[5px_14px] rounded-md font-sans font-medium text-[0.78rem] cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:brightness-110 active:brightness-90 transition-all disabled:opacity-50"
              >
                {isLoading ? "Loading DB..." : "Run Query"}
              </button>
            </div>
          </div>

          <textarea
            id="sql-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik query SQL di sini..."
            className="w-full bg-black/40 text-[#e5e5ea] border border-white/10 rounded-lg p-[10px_12px] font-mono text-[0.88rem] resize-none focus:outline-none focus:border-[#0a84ff] focus:ring-[3.5px] focus:ring-[#0a84ff]/35"
          />
        </section>

        {caseData.hints.length > 0 && (
          <div className="os-hint-box bg-[#ff9f0a]/15 border border-[#ff9f0a]/40 text-[#ffd60a] font-sans p-[8px_12px] rounded-lg text-[0.78rem]">
            💡 <b>Petunjuk:</b> {caseData.hints[0]}
          </div>
        )}

        <section className="os-result-section flex-1 flex flex-col overflow-hidden min-h-0">
          {activeError && (
            <div className="os-error text-[#ff6961] p-[10px_12px] bg-[#ff453a]/14 border border-[#ff453a]/40 rounded-lg text-[0.8rem]">
              ⚠️ {activeError}
            </div>
          )}

          {!activeError && result && (
            <div className="os-table-wrapper flex-1 overflow-auto border border-white/10 rounded-lg bg-black/30 max-h-full">
              {result.values.length === 0 ? (
                <div className="os-empty text-[#a1a1a6] font-sans p-3 text-[0.82rem]">
                  Query berhasil dieksekusi tetapi data kosong.
                </div>
              ) : (
                <table className="os-table w-full border-collapse text-[0.8rem] whitespace-nowrap">
                  <thead>
                    <tr>
                      {result.columns.map((col: string, idx: number) => (
                        <th
                          key={`th-${col}-${idx}`}
                          className="bg-[#222225] text-[#a1a1a6] font-sans font-semibold text-[0.72rem] sticky top-0 z-10 border-b border-white/8 p-[7px_12px] text-left"
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
                        className="hover:bg-[#0a84ff]/18 even:bg-white/2"
                      >
                        {row.map((val, cIdx) => (
                          <td
                            key={`td-cell-${rIdx}-${cIdx}`}
                            className="border-b border-white/8 p-[7px_12px] text-left text-[#e5e5ea]"
                          >
                            {val === null ? (
                              <i className="text-white/30">NULL</i>
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
          )}
        </section>
      </main>
    </div>
  );
};
