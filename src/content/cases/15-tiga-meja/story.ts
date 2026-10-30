// Chapter 15: Tiga Meja Sekaligus (tingkat menengah, JOIN tiga tabel)
import type { CaseData } from "@/types/case.types";

export const tigaMejaCase: CaseData = {
  id: "15-tiga-meja",
  title: "Tiga Meja Sekaligus",
  date: "6 November 2026",
  meta: {
    number: "15",
    location: "Meja Sirkulasi",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Data peminjaman tersebar di tiga tabel. Gabungkan anggota, buku, dan peminjaman untuk melihat siapa membaca apa.",
    skills: ["JOIN tiga tabel", "Alias tabel", "WHERE", "ORDER BY"],
  },
  briefing:
    "Sirkulasi ingin tahu siapa saja yang meminjam buku kategori Teknologi. Data anggota, buku, dan peminjaman ada di tiga tabel terpisah. Tampilkan nama anggota, judul buku, dan tanggal pinjam untuk semua peminjaman buku Teknologi, diurutkan berdasarkan tanggal pinjam.",

  hints: [
    "Gabungkan peminjaman dengan anggota lewat anggota_id, lalu dengan buku lewat buku_id. Itu dua JOIN.",
    "Syarat kategori ditulis di WHERE setelah semua JOIN.",
  ],

  cheatJoin: {
    a: "peminjaman",
    aKey: "anggota_id",
    b: "anggota",
    bKey: "id",
  },

  schemaSql: `
    CREATE TABLE anggota (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      fakultas VARCHAR(50) NOT NULL
    );

    INSERT INTO anggota VALUES
    (101, 'Budi', 'Ekonomi'),
    (102, 'Sari', 'Teknik'),
    (103, 'Yoga', 'Hukum');

    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL,
      kategori VARCHAR(50) NOT NULL
    );

    INSERT INTO buku VALUES
    (1, 'Dasar Basis Data', 'Teknologi'),
    (2, 'Peta Tanpa Batas', 'Sejarah'),
    (3, 'Algoritma Dasar', 'Teknologi');

    CREATE TABLE peminjaman (
      id INT PRIMARY KEY,
      anggota_id INT NOT NULL,
      buku_id INT NOT NULL,
      tgl_pinjam DATE NOT NULL
    );

    INSERT INTO peminjaman VALUES
    (1, 101, 1, '2026-10-01'),
    (2, 102, 3, '2026-10-03'),
    (3, 103, 2, '2026-10-05'),
    (4, 101, 3, '2026-10-07'),
    (5, 103, 1, '2026-10-09');
  `,

  answerSql: `
    SELECT a.nama, b.judul, p.tgl_pinjam
    FROM peminjaman p
    JOIN anggota a ON a.id = p.anggota_id
    JOIN buku b ON b.id = p.buku_id
    WHERE b.kategori = 'Teknologi'
    ORDER BY p.tgl_pinjam;
  `,
};
