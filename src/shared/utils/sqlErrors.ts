import type { SchemaTable } from "./parseSchema";

type Schema = Pick<SchemaTable, "name" | "cols">[];

interface Rule {
  test: RegExp;
  explain: (m: RegExpMatchArray, schema: Schema) => string;
}

/** Jarak edit (Levenshtein) dua teks, untuk menebak kata yang salah eja */
const levenshtein = (a: string, b: string): number => {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length];
};

/**
 * Mencari nama yang paling mirip dari daftar kandidat. Nama yang memuat teks
 * salah diutamakan (misalnya "nama" -> "nama_anggota"), lalu yang selisih
 * ejaannya paling kecil.
 */
export const findSimilar = (name: string, candidates: string[]): string | null => {
  const target = name.toLowerCase();
  if (!target) return null;

  let best: string | null = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const cand = candidate.toLowerCase();
    if (cand === target) continue;

    const contains = cand.includes(target) || target.includes(cand);
    const dist = levenshtein(target, cand);
    const limit = Math.max(2, Math.floor(Math.max(target.length, cand.length) / 3));
    if (!contains && dist > limit) continue;

    const score = contains ? 0 : dist;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
};

/** Bagian nama tanpa awalan tabel: "a.nama" -> "nama" */
const bareName = (name: string) => name.split(".").pop() ?? name;

const suggestion = (name: string, candidates: string[]): string => {
  const found = findSimilar(bareName(name), candidates);
  return found ? ` Mungkin yang dimaksud "${found}".` : "";
};

/** Pesan error dari SQLite, diubah menjadi penjelasan dan saran perbaikan */
const RULES: Rule[] = [
  {
    test: /no such table: ([\w.]+)/i,
    explain: (m, schema) =>
      `Tabel "${m[1]}" tidak ditemukan.${suggestion(
        m[1],
        schema.map((t) => t.name),
      )} Periksa ejaan namanya di daftar Skema database di sebelah kiri.`,
  },
  {
    test: /no such column: ([\w.]+)/i,
    explain: (m, schema) =>
      `Kolom "${m[1]}" tidak ada di tabel yang dipakai.${suggestion(
        m[1],
        schema.flatMap((t) => t.cols),
      )} Coba cek daftar kolom di Skema database, dan pastikan tabelnya sudah disebut di FROM atau JOIN.`,
  },
  {
    test: /ambiguous column name: ([\w.]+)/i,
    explain: (m) =>
      `Kolom "${m[1]}" ada di lebih dari satu tabel. Tulis nama tabel di depannya, misalnya tabel.kolom.`,
  },
  {
    test: /near "([^"]*)": syntax error/i,
    explain: (m) =>
      `Penulisan di dekat "${m[1]}" belum benar. Biasanya ada kata kunci yang salah eja, tanda koma yang kurang atau berlebih, atau tanda baca yang hilang.`,
  },
  {
    test: /incomplete input/i,
    explain: () =>
      "Kueri belum selesai. Periksa apakah ada tanda kutip atau kurung yang belum ditutup, atau bagian kueri yang terpotong.",
  },
  {
    test: /unrecognized token/i,
    explain: () =>
      "Ada simbol atau tanda kutip yang tidak dikenali. Untuk teks gunakan tanda kutip tunggal, misalnya 'Novel'.",
  },
  {
    test: /misuse of aggregate/i,
    explain: () =>
      "Fungsi seperti COUNT atau SUM dipakai di tempat yang tidak sesuai. Coba tambahkan GROUP BY, atau pindahkan syarat kelompok ke HAVING.",
  },
  {
    test: /no such function: (\w+)/i,
    explain: (m) => `Fungsi "${m[1]}" tidak dikenal. Periksa ejaannya.`,
  },
  {
    test: /UNIQUE constraint failed: ([\w.]+)/i,
    explain: (m) =>
      `Nilai di kolom "${bareName(m[1])}" sudah dipakai baris lain, padahal kolom ini harus unik.`,
  },
  {
    test: /NOT NULL constraint failed: ([\w.]+)/i,
    explain: (m) =>
      `Kolom "${bareName(m[1])}" wajib diisi, jadi tidak boleh kosong (NULL).`,
  },
  {
    test: /datatype mismatch/i,
    explain: () =>
      "Tipe data tidak cocok. Biasanya teks ditulis tanpa tanda kutip, atau angka dibandingkan dengan teks.",
  },
];

/**
 * Mengubah pesan error SQLite menjadi penjelasan dan saran langkah.
 * Bila `schema` diberikan, nama yang salah eja akan dicarikan padanannya.
 */
export const explainSqlError = (message: string, schema: Schema = []): string => {
  for (const rule of RULES) {
    const m = message.match(rule.test);
    if (m) return rule.explain(m, schema);
  }
  return "Kueri belum bisa dijalankan. Periksa lagi penulisannya.";
};
