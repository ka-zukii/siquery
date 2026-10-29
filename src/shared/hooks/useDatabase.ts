import { useState, useEffect, useRef, useCallback } from "react";
import { DatabaseEngine } from "@/engine/DatabaseEngine";
import type { QueryResult } from "@/types/case.types";

interface UseDatabaseReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  executeQuery: (query: string) => QueryResult | null;
  resetDb: () => void;
}

export function useDatabase(schemaSql: string): UseDatabaseReturn {
  const engineRef = useRef<DatabaseEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const engine = new DatabaseEngine();
    engineRef.current = engine;

    async function setup() {
      try {
        setIsLoading(true);
        setError(null);
        await engine.init(schemaSql);

        if (isMounted) {
          setIsReady(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Gagal memuat database SQLite WASM.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    setup();

    return () => {
      isMounted = false;
      engine.close();
      engineRef.current = null;
    };
  }, [schemaSql]);

  const executeQuery = useCallback((query: string): QueryResult | null => {
    if (!engineRef.current || !engineRef.current.isReady()) {
      setError("Database belum siap dieksekusi.");
      return null;
    }

    try {
      setError(null);
      return engineRef.current.runQuery(query);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat menjalankan query.");
      return null;
    }
  }, []);

  const resetDb = useCallback(() => {
    if (engineRef.current && engineRef.current.isReady()) {
      engineRef.current.resetDatabase();
    }
  }, []);

  return {
    isReady,
    isLoading,
    error,
    executeQuery,
    resetDb,
  };
}
