import initSqlJs, { type Database, type QueryExecResult } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { QueryResult } from "../types/case.types";

export class DatabaseEngine {
  private db: Database | null = null;
  private schemaSql: string = "";

  public async init(schemaSql: string): Promise<void> {
    this.schemaSql = schemaSql;

    const SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl,
    });

    this.db = new SQL.Database();
    this.db.run(this.schemaSql);
  }

  public runQuery(query: string): QueryResult {
    if (!this.db) {
      throw new Error("Database belum siap atau gagal diinisialisasi.");
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { columns: [], values: [] };
    }

    const res: QueryExecResult[] = this.db.exec(trimmedQuery);

    if (res.length === 0) {
      return { columns: [], values: [] };
    }

    return {
      columns: res[0].columns,
      values: res[0].values,
    };
  }

  public resetDatabase(): void {
    if (!this.db || !this.schemaSql) return;
    this.db.close();

    // Buat instance database baru dan jalankan kembali skema awal
    const SQL = (this.db as any).constructor;
    this.db = new SQL();
    this.db!.run(this.schemaSql);
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  public isReady(): boolean {
    return this.db !== null;
  }
}
