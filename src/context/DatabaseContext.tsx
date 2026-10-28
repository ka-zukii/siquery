import React, { createContext, useContext, type ReactNode } from "react";
import { useDatabase } from "../hooks/useDatabase";
import type { QueryResult } from "../types/case.types";

interface DatabaseContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  executeQuery: (query: string) => QueryResult | null;
  resetDb: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{
  schemaSql: string;
  children: ReactNode;
}> = ({ schemaSql, children }) => {
  const dbState = useDatabase(schemaSql);

  return (
    <DatabaseContext.Provider value={dbState}>
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
