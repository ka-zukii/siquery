import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useDatabase } from "../hooks/useDatabase";
import { isSameResult } from "../utils/checkAnswer";
import type { QueryResult } from "../types/case.types";

/** Satu kueri yang pernah dijalankan */
export interface HistoryItem {
  id: number;
  query: string;
  ok: boolean;
  rows: number;
  at: string;
}

/** Isi editor SQL. Disimpan di context supaya tidak hilang saat komputer ditutup. */
export interface SqlDraft {
  query: string;
  result: QueryResult | null;
  localError: string | null;
  activeTable: string | null;
  history: HistoryItem[];
}

const INITIAL_DRAFT: SqlDraft = {
  query: "SELECT * FROM access_logs WHERE status = 'GRANTED';",
  result: null,
  localError: null,
  activeTable: null,
  history: [],
};

interface DatabaseContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  executeQuery: (query: string) => QueryResult | null;
  /** Menjalankan kueri pemain dan mengecek apakah tiket sudah selesai */
  submitQuery: (query: string) => QueryResult | null;
  /** true setelah hasil kueri pemain cocok dengan jawaban chapter */
  solved: boolean;
  resetDb: () => void;
  /** Menandai tiket selesai, dipakai oleh formulir laporan */
  markSolved: () => void;
  /** Isi editor SQL yang bertahan walau komputer ditutup */
  sqlDraft: SqlDraft;
  updateDraft: (patch: Partial<SqlDraft>) => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{
  schemaSql: string;
  answerSql?: string;
  children: ReactNode;
}> = ({ schemaSql, answerSql, children }) => {
  const db = useDatabase(schemaSql);
  const [solved, setSolved] = useState(false);
  const markSolved = useCallback(() => setSolved(true), []);

  const [sqlDraft, setSqlDraft] = useState<SqlDraft>(INITIAL_DRAFT);
  const updateDraft = useCallback(
    (patch: Partial<SqlDraft>) => setSqlDraft((d) => ({ ...d, ...patch })),
    [],
  );

  const submitQuery = useCallback(
    (query: string) => {
      const res = db.executeQuery(query);
      if (res && answerSql && !solved) {
        const expected = db.executeQuery(answerSql);
        if (expected && isSameResult(res, expected)) {
          setSolved(true);
        }
      }
      return res;
    },
    [db.executeQuery, answerSql, solved],
  );

  const value: DatabaseContextType = {
    ...db,
    submitQuery,
    solved,
    markSolved,
    sqlDraft,
    updateDraft,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDb = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDb harus digunakan di dalam DatabaseProvider");
  }
  return context;
};
