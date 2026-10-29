import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useDatabase } from "@/shared/hooks/useDatabase";
import {
  buildFeedback,
  isSameResult,
  type QueryFeedback,
} from "@/shared/utils/checkAnswer";
import { parseSchema } from "@/shared/utils/parseSchema";
import type { QueryResult } from "@/types/case.types";

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
  /** Seberapa dekat kueri terakhir dengan target. Null bila belum ada atau sudah benar. */
  feedback: QueryFeedback | null;
  /** Jumlah kueri yang belum tepat untuk chapter ini, dipakai untuk petunjuk bertahap */
  wrongCount: number;
  /** Isi editor SQL yang bertahan walau komputer ditutup */
  sqlDraft: SqlDraft;
  updateDraft: (patch: Partial<SqlDraft>) => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{
  schemaSql: string;
  answerSql?: string;
  /** Chapter yang sudah selesai sebelumnya, supaya tidak memicu notifikasi ulang */
  initialSolved?: boolean;
  children: ReactNode;
}> = ({ schemaSql, answerSql, initialSolved = false, children }) => {
  const db = useDatabase(schemaSql);
  const [solved, setSolved] = useState(initialSolved);
  const markSolved = useCallback(() => setSolved(true), []);
  const [feedback, setFeedback] = useState<QueryFeedback | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  // Kueri awal memakai tabel pertama dari kasus ini, bukan tabel dari kasus lain
  const [sqlDraft, setSqlDraft] = useState<SqlDraft>(() => {
    const firstTable = parseSchema(schemaSql)[0]?.name;
    return {
      query: firstTable ? `SELECT * FROM ${firstTable};` : "",
      result: null,
      localError: null,
      activeTable: null,
      history: [],
    };
  });
  const updateDraft = useCallback(
    (patch: Partial<SqlDraft>) => setSqlDraft((d) => ({ ...d, ...patch })),
    [],
  );

  const submitQuery = useCallback(
    (query: string) => {
      const res = db.executeQuery(query);

      if (!res || res.error) {
        setFeedback(null);
        return res;
      }

      if (answerSql && !solved) {
        const expected = db.executeQuery(answerSql);
        if (expected) {
          if (isSameResult(res, expected)) {
            setSolved(true);
            setFeedback(null);
          } else {
            setFeedback(buildFeedback(res, expected));
            setWrongCount((n) => n + 1);
          }
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
    feedback,
    wrongCount,
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
