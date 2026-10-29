import type { CaseData, CheatJoin } from "@/types/case.types";
import { parseSchema, type SchemaTable } from "@/shared/utils/parseSchema";

export interface CheatEntry {
  skill: string;
  judul: string;
  kode: string;
}

interface JoinPair {
  a: SchemaTable;
  b: SchemaTable;
  /** Kolom di tabel a yang dipakai untuk menggabungkan */
  aKey: string;
  /** Kolom di tabel b yang dipakai untuk menggabungkan */
  bKey: string;
  /** Kondisi gabung kustom, bila ada */
  on?: string;
}

/** Memakai kunci yang ditulis di chapter, bila tabelnya ada di skema */
const configuredPair = (
  tables: SchemaTable[],
  cfg?: CheatJoin,
): JoinPair | null => {
  if (!cfg) return null;
  const a = tables.find((t) => t.name === cfg.a);
  const b = tables.find((t) => t.name === cfg.b);
  if (!a || !b) return null;
  return { a, b, aKey: cfg.aKey, bKey: cfg.bKey, on: cfg.on };
};

/**
 * Mencari pasangan tabel untuk contoh JOIN. Urutan prioritas:
 * 1. Kunci asing: tabel a punya kolom "<nama tabel b>_id" dan tabel b punya kolom id.
 * 2. Kolom bersama selain id (misalnya kode_kelas di kedua tabel).
 * 3. Kolom id bersama, hanya bila tidak ada pilihan lain.
 */
const pickPair = (tables: SchemaTable[]): JoinPair | null => {
  for (const a of tables) {
    for (const b of tables) {
      if (a === b || !b.cols.includes("id")) continue;
      const fk = a.cols.find(
        (c) => c.endsWith("_id") && b.name.startsWith(c.slice(0, -3)),
      );
      if (fk) return { a, b, aKey: fk, bKey: "id" };
    }
  }

  for (const a of tables) {
    for (const b of tables) {
      if (a === b) continue;
      const shared = a.cols.find((c) => c !== "id" && b.cols.includes(c));
      if (shared) return { a, b, aKey: shared, bKey: shared };
    }
  }

  for (const a of tables) {
    for (const b of tables) {
      if (a !== b && a.cols.includes("id") && b.cols.includes("id")) {
        return { a, b, aKey: "id", bKey: "id" };
      }
    }
  }

  return null;
};

/** Kolom yang layak ditampilkan di contoh: tanpa kunci gabung, dan id hanya bila tidak ada pilihan lain */
const displayCols = (cols: string[], exclude: string[]): string[] => {
  const rest = cols.filter((c) => !exclude.includes(c));
  const nonId = rest.filter((c) => c !== "id");
  return nonId.length > 0 ? nonId : rest;
};

/**
 * Contekan untuk satu chapter. Nama tabel, kolom, dan kunci gabung diambil dari skema kasus.
 * Kondisinya dibiarkan sebagai bentuk umum supaya tidak membocorkan jawaban.
 */
export const buildCheatSheet = (caseData: CaseData) => {
  const tables = parseSchema(caseData.schemaSql);
  const pair = configuredPair(tables, caseData.cheatJoin) ?? pickPair(tables);
  const joinOn = pair?.on ?? `b.${pair?.bKey ?? "kunci"} = a.${pair?.aKey ?? "kunci"}`;

  const A = pair?.a ?? tables[0];
  const B = pair?.b ?? tables[1] ?? tables[0];
  const aKey = pair?.aKey ?? "kunci";
  const bKey = pair?.bKey ?? "kunci";

  const t1 = A?.name ?? "nama_tabel";
  const t2 = B?.name ?? t1;

  // Kondisi untuk subkueri: pencocokan nilai kolom, atau EXISTS bila kondisi gabung kustom
  const subqueryCond = pair?.on
    ? `EXISTS (\n  SELECT 1 FROM ${t2} b\n  WHERE ${pair.on}\n)`
    : `a.${aKey} IN (\n  SELECT ${bKey} FROM ${t2}\n)`;
  const aCols = displayCols(A?.cols ?? [], [aKey]);
  const bCols = displayCols(B?.cols ?? [], [bKey]);
  const c1 = aCols[0] ?? aKey;
  const c1b = aCols[1] ?? c1;
  const c2 = bCols[0] ?? bKey;

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
      kode: `SELECT a.${c1}, b.${c2}\nFROM ${t1} a\nJOIN ${t2} b ON ${joinOn};`,
    },
    {
      skill: "LEFT JOIN",
      judul: "Tetap tampilkan baris tanpa pasangan",
      kode: `SELECT a.${c1}, b.${c2}\nFROM ${t1} a\nLEFT JOIN ${t2} b ON ${joinOn};`,
    },
    {
      skill: "IS NULL",
      judul: "Cari nilai kosong",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} IS NULL;\n-- kebalikannya: WHERE ${c1} IS NOT NULL;`,
    },
    {
      skill: "GROUP BY",
      judul: "Kelompokkan hasil",
      kode: `SELECT ${aKey}, COUNT(*) AS jumlah\nFROM ${t1}\nGROUP BY ${aKey};`,
    },
    {
      skill: "HAVING",
      judul: "Saring setelah dikelompokkan",
      kode: `SELECT ${aKey}, COUNT(*) AS jumlah\nFROM ${t1}\nGROUP BY ${aKey}\nHAVING COUNT(*) >= 2;`,
    },
    {
      skill: "COUNT",
      judul: "Hitung baris",
      kode: `SELECT COUNT(*) AS jumlah\nFROM ${t1};`,
    },
    {
      skill: "SUM",
      judul: "Jumlahkan nilai per kelompok",
      kode: `SELECT ${aKey}, SUM(${c1}) AS total\nFROM ${t1}\nGROUP BY ${aKey};`,
    },
    {
      skill: "COALESCE",
      judul: "Ganti nilai kosong dengan angka",
      kode: `SELECT ${aKey}, COALESCE(${c1}, 0) AS nilai\nFROM ${t1};`,
    },
    {
      skill: "LIKE",
      judul: "Cari teks yang mengandung kata",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} LIKE '%kata%';`,
    },
    {
      skill: "SUBQUERY",
      judul: "Kondisi dari kueri lain",
      kode: `SELECT *\nFROM ${t1} a\nWHERE ${subqueryCond};`,
    },
    {
      skill: "BETWEEN",
      judul: "Rentang nilai",
      kode: `SELECT *\nFROM ${t1}\nWHERE ${c1} BETWEEN 'awal' AND 'akhir';`,
    },
    {
      skill: "EXISTS",
      judul: "Cek apakah ada pasangan",
      kode: `SELECT a.${c1}\nFROM ${t1} a\nWHERE NOT EXISTS (\n  SELECT 1 FROM ${t2} b\n  WHERE b.${bKey} = a.${aKey}\n);`,
    },
    {
      skill: "WITH",
      judul: "Kueri sementara",
      kode: `WITH sementara AS (\n  SELECT ${c1} FROM ${t1}\n)\nSELECT * FROM sementara;`,
    },
    {
      skill: "CASE",
      judul: "Beri label bersyarat",
      kode: `SELECT ${aKey},\n  CASE\n    WHEN ${c1} IS NULL THEN 'kosong'\n    ELSE 'ada'\n  END AS keterangan\nFROM ${t1};`,
    },
    {
      skill: "UNION",
      judul: "Gabungkan hasil dua kueri",
      kode: `SELECT ${aKey} FROM ${t1}\nUNION ALL\nSELECT ${bKey} FROM ${t2};`,
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
