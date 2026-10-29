import type { QueryResult } from "@/types/case.types";

const toKey = (v: unknown) => (v === null ? "NULL" : String(v));

/**
 * Kueri pemain dianggap benar bila jumlah barisnya sama dengan jawaban, dan
 * setiap baris jawaban ditemukan di baris pemain (urutan baris dan kolom
 * tidak dipentingkan, kolom tambahan diperbolehkan).
 */
export const isSameResult = (
  player: QueryResult,
  expected: QueryResult,
): boolean => {
  if (
    player.values.length === 0 ||
    player.values.length !== expected.values.length
  ) {
    return false;
  }

  const playerRows = player.values.map((row) => row.map(toKey));
  const used = playerRows.map(() => false);

  return expected.values.every((expRow) => {
    const need = expRow.map(toKey);
    const idx = playerRows.findIndex(
      (row, i) => !used[i] && need.every((v) => row.includes(v)),
    );
    if (idx === -1) return false;
    used[idx] = true;
    return true;
  });
};

/**
 * Untuk pelajaran yang urutannya penting (ORDER BY). Setiap baris pemain pada posisi
 * yang sama harus memuat nilai baris target di posisi itu.
 */
export const isSameOrderedResult = (
  player: QueryResult,
  expected: QueryResult,
): boolean => {
  if (
    player.values.length === 0 ||
    player.values.length !== expected.values.length
  ) {
    return false;
  }
  return expected.values.every((expRow, i) => {
    const need = expRow.map(toKey);
    const row = player.values[i].map(toKey);
    return need.every((v) => row.includes(v));
  });
};

/** Berapa baris target yang sudah ditemukan di hasil pemain (jumlah baris diabaikan) */
export const countMatchingRows = (
  player: QueryResult,
  expected: QueryResult,
): number => {
  const playerRows = player.values.map((row) => row.map(toKey));
  const used = playerRows.map(() => false);
  let matched = 0;

  expected.values.forEach((expRow) => {
    const need = expRow.map(toKey);
    const idx = playerRows.findIndex(
      (row, i) => !used[i] && need.every((v) => row.includes(v)),
    );
    if (idx !== -1) {
      used[idx] = true;
      matched++;
    }
  });

  return matched;
};

export type QueryFeedback =
  | { kind: "empty" }
  | { kind: "extra"; playerRows: number; total: number }
  | { kind: "partial"; matched: number; total: number }
  | { kind: "none"; total: number }
  /** Semua baris sudah benar, tetapi urutannya belum */
  | { kind: "order" };

/** Membandingkan hasil pemain dengan target. Dipanggil hanya kalau kueri belum benar. */
export const buildFeedback = (
  player: QueryResult,
  expected: QueryResult,
): QueryFeedback => {
  const total = expected.values.length;
  const playerRows = player.values.length;

  if (playerRows === 0) return { kind: "empty" };

  const matched = countMatchingRows(player, expected);
  if (matched === total && playerRows > total) {
    return { kind: "extra", playerRows, total };
  }
  if (matched > 0) return { kind: "partial", matched, total };
  return { kind: "none", total };
};

export const describeFeedback = (f: QueryFeedback): string => {
  switch (f.kind) {
    case "empty":
      return "Kueri berjalan, tetapi hasilnya kosong. Periksa nama tabel, nama kolom, dan kondisi WHERE.";
    case "extra":
      return `Semua baris yang dicari sudah ada, tetapi hasilmu punya ${f.playerRows} baris. Ada baris yang tidak seharusnya ikut. Periksa kembali kondisi filternya.`;
    case "partial":
      return `${f.matched} dari ${f.total} baris yang dicari sudah cocok. Periksa kondisi atau pengelompokannya untuk baris sisanya.`;
    case "order":
      return "Semua baris sudah benar, tetapi urutannya belum sesuai. Periksa kolom dan arah pengurutan di ORDER BY.";
    case "none":
      return "Belum ada baris yang cocok dengan target. Periksa lagi kolom yang ditampilkan dan kondisinya.";
  }
};
