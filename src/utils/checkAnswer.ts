import type { QueryResult } from "../types/case.types";

const toKey = (v: unknown) => (v === null ? "NULL" : String(v));

/**
 * Kueri pemain dianggap benar bila jumlah barisnya sama dengan jawaban, dan
 * setiap baris jawaban ditemukan di baris pemain (urutan baris dan kolom
 * tidak dipentingkan, kolom tambahan diperbolehkan).
 */
export const isSameResult = (player: QueryResult, expected: QueryResult): boolean => {
  if (player.values.length === 0 || player.values.length !== expected.values.length) {
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
