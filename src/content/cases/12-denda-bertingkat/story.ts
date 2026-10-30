// Chapter 12: Denda Bertingkat (tingkat menengah, CASE dan selisih tanggal)
import type { CaseData } from "@/types/case.types";

export const dendaBertingkatCase: CaseData = {
  id: "12-denda-bertingkat",
  title: "Denda Bertingkat",
  date: "3 November 2026",
  meta: {
    number: "12",
    location: "Meja Pengembalian",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Aturan denda baru membagi keterlambatan menjadi beberapa kelompok. Hitung selisih hari dan beri kategori untuk setiap pengembalian.",
    skills: ["CASE WHEN", "julianday", "Ekspresi kolom"],
  },
  briefing:
    "Aturan denda baru membedakan keterlambatan menjadi tiga kelompok. Hitung berapa hari setiap buku terlambat dikembalikan, lalu beri kategorinya: Tepat waktu jika tidak terlambat, Ringan jika 1 sampai 7 hari, Sedang jika 8 sampai 14 hari, dan Berat jika lebih dari 14 hari. Tampilkan id, id anggota, jumlah hari terlambat (0 jika tepat waktu), dan kategorinya, diurutkan berdasarkan id.",

  hints: [
    "Selisih hari bisa dihitung dengan julianday(tgl_kembali) - julianday(tgl_jatuh_tempo).",
    "Gunakan CASE WHEN ... THEN ... ELSE ... END untuk memberi kategori. Urutkan kondisinya dari yang paling kecil, dan pastikan nilai 0 atau negatif menjadi Tepat waktu.",
  ],

  schemaSql: `
    CREATE TABLE pengembalian (
      id INT PRIMARY KEY,
      anggota_id INT NOT NULL,
      buku_id INT NOT NULL,
      tgl_jatuh_tempo DATE NOT NULL,
      tgl_kembali DATE NOT NULL
    );

    INSERT INTO pengembalian VALUES
    (1, 101, 1, '2026-10-05', '2026-10-05'),
    (2, 102, 3, '2026-10-05', '2026-10-09'),
    (3, 103, 4, '2026-10-10', '2026-10-27'),
    (4, 101, 2, '2026-10-12', '2026-10-11'),
    (5, 104, 5, '2026-10-15', '2026-10-22'),
    (6, 102, 6, '2026-10-20', '2026-10-21'),
    (7, 105, 3, '2026-10-01', '2026-10-30');
  `,

  answerSql: `
    SELECT
      id,
      anggota_id,
      MAX(0, CAST(julianday(tgl_kembali) - julianday(tgl_jatuh_tempo) AS INTEGER)) AS hari_terlambat,
      CASE
        WHEN julianday(tgl_kembali) - julianday(tgl_jatuh_tempo) <= 0 THEN 'Tepat waktu'
        WHEN julianday(tgl_kembali) - julianday(tgl_jatuh_tempo) <= 7 THEN 'Ringan'
        WHEN julianday(tgl_kembali) - julianday(tgl_jatuh_tempo) <= 14 THEN 'Sedang'
        ELSE 'Berat'
      END AS kategori
    FROM pengembalian
    ORDER BY id;
  `,
};
