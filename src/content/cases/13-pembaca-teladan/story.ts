// Chapter 13: Pembaca Teladan (tingkat sulit, CTE dan subquery per kelompok)
import type { CaseData } from "@/types/case.types";

export const pembacaTeladanCase: CaseData = {
  id: "13-pembaca-teladan",
  title: "Pembaca Teladan",
  date: "4 November 2026",
  meta: {
    number: "13",
    location: "Ruang Baca Fakultas",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Setiap fakultas ingin memberi penghargaan kepada pembaca paling rajin. Hitung peminjaman per anggota dulu, lalu ambil juara di tiap fakultas.",
    skills: ["WITH (CTE)", "GROUP BY", "Subquery", "MAX"],
  },
  briefing:
    "Perpustakaan akan memberi penghargaan Pembaca Teladan untuk setiap fakultas. Pemenangnya adalah anggota dengan jumlah peminjaman terbanyak di fakultasnya. Hitung dulu jumlah peminjaman setiap anggota, lalu tampilkan fakultas, nama pemenang, dan jumlah pinjamannya, diurutkan berdasarkan fakultas. Setiap fakultas dijamin hanya punya satu pemenang.",

  hints: [
    "Mulai dengan WITH jumlah AS (...) yang menghitung COUNT(*) per anggota, lalu gabungkan dengan anggota.",
    "Di kueri akhir, bandingkan total dengan MAX(total) dari fakultas yang sama. Subquery kedua bisa memakai alias berbeda agar tidak tertukar.",
  ],

  schemaSql: `
    CREATE TABLE anggota (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      fakultas VARCHAR(50) NOT NULL
    );

    INSERT INTO anggota VALUES
    (101, 'Budi', 'Ekonomi'),
    (102, 'Sari', 'Teknik'),
    (103, 'Yoga', 'Teknik'),
    (104, 'Rina', 'Ekonomi'),
    (105, 'Doni', 'Hukum'),
    (106, 'Lia', 'Hukum');

    CREATE TABLE peminjaman (
      id INT PRIMARY KEY,
      buku_id INT NOT NULL,
      anggota_id INT NOT NULL,
      tgl_pinjam DATE NOT NULL
    );

    INSERT INTO peminjaman VALUES
    (1, 1, 101, '2026-09-01'),
    (2, 2, 101, '2026-09-04'),
    (3, 3, 101, '2026-09-09'),
    (4, 4, 104, '2026-09-11'),
    (5, 5, 102, '2026-09-15'),
    (6, 6, 102, '2026-09-20'),
    (7, 7, 102, '2026-10-01'),
    (8, 8, 102, '2026-10-05'),
    (9, 1, 103, '2026-10-06'),
    (10, 2, 105, '2026-10-08'),
    (11, 3, 105, '2026-10-12'),
    (12, 4, 106, '2026-10-20');
  `,

  answerSql: `
    WITH jumlah AS (
      SELECT a.id, a.nama, a.fakultas, COUNT(*) AS total
      FROM anggota a
      JOIN peminjaman p ON p.anggota_id = a.id
      GROUP BY a.id, a.nama, a.fakultas
    )
    SELECT j.fakultas, j.nama, j.total
    FROM jumlah j
    WHERE j.total = (
      SELECT MAX(j2.total) FROM jumlah j2 WHERE j2.fakultas = j.fakultas
    )
    ORDER BY j.fakultas;
  `,
};
