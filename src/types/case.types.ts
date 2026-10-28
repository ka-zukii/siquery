export interface QueryResult {
  columns: string[];
  values: (string | number | Uint8Array | null)[][];
  error?: string;
}

export interface ClueItem {
  id: string;
  objectName: string; // Nama Mesh di Three.js
  title: string;
  category: "document" | "evidence"; // Berkas kertas atau Barang bukti fisik
  dateOrTag: string;
  content: string;
}

export interface CaseData {
  id: string;
  title: string;
  date: string;
  briefing: string;
  schemaSql: string;
  clues: ClueItem[];
  hints: string[];
  solution: {
    culpritId: number;
    stolenCardId: string;
    evidenceBookId: string;
  };
}
