// Chapter 11: Rak yang Sunyi (tingkat menengah, NOT EXISTS)
import type { CaseData } from "@/types/case.types";

export const rakYangSunyiCase: CaseData = {
  id: "11-rak-yang-sunyi",
  title: "Rak yang Sunyi",
  date: "2 November 2026",
  meta: {
    number: "11",
    location: "Lorong Koleksi Lama",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Ada buku di lorong lama yang tidak pernah disentuh siapa pun. Cari buku yang belum pernah dipinjam sama sekali.",
    skills: ["NOT EXISTS", "Subquery", "ORDER BY"],
  },
  briefing:
    "Pustakawan ingin menyusun ulang lorong koleksi lama. Sebelum buku dipindahkan, ia perlu tahu buku mana yang sama sekali belum pernah dipinjam. Tampilkan judul semua buku yang tidak punya satu pun catatan peminjaman, diurutkan berdasarkan judul.",

  hints: [
    "Cari buku yang TIDAK punya baris di tabel peminjaman. Gunakan NOT EXISTS dengan subquery.",
    "Di dalam subquery, hubungkan p.buku_id dengan b.id dari tabel buku.",
  ],

  cheatJoin: {
    a: "buku",
    aKey: "id",
    b: "peminjaman",
    bKey: "buku_id",
  },

  schemaSql: `
    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL,
      kategori VARCHAR(50) NOT NULL,
      rak VARCHAR(20) NOT NULL
    );

    INSERT INTO buku VALUES
    (1, 'Arsip Kerajaan', 'Sejarah', 'L-01'),
    (2, 'Peta Tanpa Batas', 'Sejarah', 'L-01'),
    (3, 'Dasar Basis Data', 'Teknologi', 'R-02'),
    (4, 'Catatan Malam', 'Novel', 'R-03'),
    (5, 'Kebun Sunyi', 'Novel', 'L-02'),
    (6, 'Surat dari Hulu', 'Puisi', 'L-02');

    CREATE TABLE peminjaman (
      id INT PRIMARY KEY,
      buku_id INT NOT NULL,
      anggota_id INT NOT NULL,
      tgl_pinjam DATE NOT NULL
    );

    INSERT INTO peminjaman VALUES
    (1, 1, 101, '2026-09-03'),
    (2, 3, 102, '2026-09-10'),
    (3, 4, 101, '2026-09-18'),
    (4, 3, 103, '2026-10-02'),
    (5, 4, 104, '2026-10-14'),
    (6, 1, 102, '2026-10-20');
  `,

  answerSql: `
    SELECT b.judul
    FROM buku b
    WHERE NOT EXISTS (
      SELECT 1 FROM peminjaman p WHERE p.buku_id = b.id
    )
    ORDER BY b.judul;
  `,
};
