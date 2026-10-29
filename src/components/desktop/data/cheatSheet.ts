import type { CaseData } from "../../../types/case.types";
import { parseSchema, type SchemaTable } from "../../../utils/parseSchema";

export interface CheatEntry {
  skill: string;
  judul: string;
  kode: string;
}

/** Mencari dua tabel yang punya kolom dengan nama sama, dipakai sebagai kunci gabung */
const pickPair = (tables: SchemaTable[]) => {
  for (let i = 0; i < tables.length; i++) {
    for (let j = 0; j < tables.length; j++) {
      if (i === j) continue;
      const key = tables[i].cols.find((c) => tables[j].cols.includes(c));
      if (key) return { a: tables[i], b: tables[j], key };
    }
  }
  return null;
};

/**
 * Contekan untuk satu chapter. Nama tabel, kolom, dan kunci gabung diambil dari skema kasus.
 * Kondisinya dibiarkan sebagai bentuk umum supaya tidak membocorkan jawaban.
 */
export const buildCheatSheet = (caseData: CaseData) => {
  const tables = parseSchema(caseData.schemaSql);
  const pair = pickPair(tables);

  const A = pair?.a ?? tables[0];
  const B = pair?.b ?? tables[1] ?? tables[0];
  const key = pair?.key ?? "kunci";

  const t1 = A?.name ?? "nama_tabel";
  const t2 = B?.name ?? t1;
  const aCols = (A?.cols ?? []).filter((c) => c !== key);
  const bCols = (B?.cols ?? []).filter((c) => c !== key);
  const c1 = aCols[0] ?? key;
  const c1b = aCols[1] ?? c1;
  const c2 = bCols[0] ?? key;

  const all: CheatEntry[] = [
    {
      skill: "SELECT",
      judul: "Pilih kolom tertentu",
      kode: `SELECT ${c1}, ${c1b}\nFROM ${t1};`,
    },
    {
      skill: "WHERE",
      judul: "Saring baris",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} = 'nilai';`,
    },
    {
      skill: "AND",
      judul: "Dua syarat sekaligus",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} = 'nilai'\n  AND ${c1b} = 'nilai';`,
    },
    {
      skill: "ORDER BY",
      judul: "Urutkan hasil",
      kode: `SELECT *\nFROM ${t1}\nORDER BY ${c1} DESC;`,
    },
    {
      skill: "JOIN",
      judul: "Gabungkan dua tabel",
      kode: `SELECT a.${c1}, b.${c2}\nFROM ${t1} a\nJOIN ${t2} b ON b.${key} = a.${key};`,
    },
    {
      skill: "LEFT JOIN",
      judul: "Tetap tampilkan baris tanpa pasangan",
      kode: `SELECT a.${c1}, b.${c2}\nFROM ${t1} a\nLEFT JOIN ${t2} b ON b.${key} = a.${key};`,
    },
    {
      skill: "IS NULL",
      judul: "Cari nilai kosong",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} IS NULL;\n-- kebalikannya: WHERE ${c1} IS NOT NULL;`,
    },
    {
      skill: "GROUP BY",
      judul: "Kelompokkan hasil",
      kode: `SELECT ${key}, COUNT(*) AS jumlah\nFROM ${t1}\nGROUP BY ${key};`,
    },
    {
      skill: "HAVING",
      judul: "Saring setelah dikelompokkan",
      kode: `SELECT ${key}, COUNT(*) AS jumlah\nFROM ${t1}\nGROUP BY ${key}\nHAVING COUNT(*) >= 2;`,
    },
    {
      skill: "COUNT",
      judul: "Hitung baris",
      kode: `SELECT COUNT(*) AS jumlah\nFROM ${t1};`,
    },
    {
      skill: "SUM",
      judul: "Jumlahkan nilai per kelompok",
      kode: `SELECT ${key}, SUM(${c1}) AS total\nFROM ${t1}\nGROUP BY ${key};`,
    },
    {
      skill: "COALESCE",
      judul: "Ganti nilai kosong dengan angka",
      kode: `SELECT ${key}, COALESCE(${c1}, 0) AS nilai\nFROM ${t1};`,
    },
    {
      skill: "LIKE",
      judul: "Cari teks yang mengandung kata",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} LIKE '%kata%';`,
    },
    {
      skill: "SUBQUERY",
      judul: "Kondisi dari kueri lain",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${key} IN (\n  SELECT ${key} FROM ${t2}\n);`,
    },
    {
      skill: "BETWEEN",
      judul: "Rentang nilai",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} BETWEEN 'awal' AND 'akhir';`,
    },
    {
      skill: "EXISTS",
      judul: "Cek apakah ada pasangan",
      kode: `SELECT a.${c1}\nFROM ${t1} a\nWHERE NOT EXISTS (\n  SELECT 1 FROM ${t2} b\n  WHERE b.${key} = a.${key}\n);`,
    },
    {
      skill: "WITH",
      judul: "Kueri sementara",
      kode: `WITH sementara AS (\n  SELECT ${c1} FROM ${t1}\n)\nSELECT * FROM sementara;`,
    },
    {
      skill: "CASE",
      judul: "Beri label bersyarat",
      kode: `SELECT ${key},\n  CASE\n    WHEN ${c1} IS NULL THEN 'kosong'\n    ELSE 'ada'\n  END AS keterangan\nFROM ${t1};`,
    },
    {
      skill: "UNION",
      judul: "Gabungkan hasil dua kueri",
      kode: `SELECT ${key} FROM ${t1}\nUNION ALL\nSELECT ${key} FROM ${t2};`,
    },
  ];

  const skills = caseData.meta.skills.map((s) => s.toUpperCase());
  const entries = all.filter((e) => skills.includes(e.skill));

  const contekan: CheatEntry = {
    skill: "*",
    judul: "Simpan hasil sebagai tabel contekan",
    kode: `CREATE TABLE contekan AS\nSELECT * FROM ${t1}\nWHERE ${c1} = 'nilai';\n-- tabel baru muncul di sidebar bertanda 'baru'`,
  };

  return { tables, entries, contekan };
};
