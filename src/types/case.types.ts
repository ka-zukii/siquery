export interface ReportOption {
  value: string;
  label: string;
}

export interface ReportField {
  key: string;
  label: string;
  hint?: string;
  options: ReportOption[];
}

export interface CaseReport {
  /** Pertanyaan dalam formulir laporan */
  fields: ReportField[];
  /** Jawaban benar: key field -> value opsi */
  answer: Record<string, string>;
  /** Teks saat laporan diterima */
  successMessage?: string;
}

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

export interface CaseMeta {
  /** Nomor chapter, misalnya "01" */
  number: string;
  location: string;
  /** Tingkat kesulitan 1-5, dipakai untuk titik-titik di kartu katalog */
  level: number;
  levelLabel: string;
  /** Ringkasan singkat untuk kartu katalog */
  summary: string;
  /** Konsep SQL yang dipakai di chapter ini */
  skills: string[];
}

export interface EmailItem {
  id: string;
  from: string;
  to?: string;
  subject: string;
  date: string;
  body: string;
}

export interface CaseData {
  id: string;
  title: string;
  date: string;
  briefing: string;
  schemaSql: string;
  meta: CaseMeta;
  clues?: ClueItem[];
  emails?: EmailItem[];
  hints: string[];
  /**
   * Kueri target. Jika hasil kueri pemain memuat semua baris dari hasil ini,
   * tiket ditandai selesai. Kosongkan bila chapter belum punya validasi.
   */
  answerSql?: string;
  report?: CaseReport;
  /** Kunci lama dari kasus pertama. Belum dipakai untuk validasi. */
  solution?: {
    culpritId: number;
    stolenCardId: string;
    evidenceBookId: string;
  };
}
