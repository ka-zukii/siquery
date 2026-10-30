// Chapter 16: Data yang Bolong (tingkat menengah, NULL dan COALESCE)
import type { CaseData } from "@/types/case.types";

export const dataBolongCase: CaseData = {
  id: "16-data-bolong",
  title: "Data yang Bolong",
  date: "7 November 2026",
  meta: {
    number: "16",
    location: "Rak Pengembalian",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Beberapa data belum lengkap: ada buku yang belum kembali dan ada anggota tanpa email. Cari buku yang masih dipinjam dan tampilkan kontak dengan rapi.",
    skills: ["IS NULL", "COALESCE", "JOIN", "ORDER BY"],
  },
  briefing:
    "Pengingat keterlambatan harus dikirim hari ini, tetapi beberapa data belum lengkap. Cari semua buku yang belum dikembalikan, yaitu yang tanggal kembalinya kosong. Tampilkan judul buku, nama peminjam, dan emailnya. Jika email kosong, tampilkan '-'. Urutkan dari tanggal pinjam paling lama.",

  hints: [
    "Buku yang belum kembali punya tgl_kembali bernilai NULL. Cek dengan IS NULL, bukan = NULL.",
    "Gunakan COALESCE(a.email, '-') untuk mengganti email yang kosong.",
  ],

  schemaSql: `
    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL
    );

    INSERT INTO buku VALUES
    (1, 'Arsip Kerajaan'),
    (2, 'Kebun Sunyi'),
    (3, 'Catatan Malam'),
    (4, 'Jejak Digital');

    CREATE TABLE anggota (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      email VARCHAR(100)
    );

    INSERT INTO anggota VALUES
    (101, 'Budi', 'budi@students.univ.ac.id'),
    (102, 'Sari', NULL),
    (103, 'Yoga', 'yoga@students.univ.ac.id');

    CREATE TABLE pengembalian (
      id INT PRIMARY KEY,
      buku_id INT NOT NULL,
      anggota_id INT NOT NULL,
      tgl_pinjam DATE NOT NULL,
      tgl_kembali DATE
    );

    INSERT INTO pengembalian VALUES
    (1, 1, 101, '2026-09-20', '2026-10-01'),
    (2, 2, 102, '2026-10-02', NULL),
    (3, 3, 103, '2026-10-05', '2026-10-20'),
    (4, 4, 101, '2026-10-08', NULL),
    (5, 2, 103, '2026-10-12', NULL);
  `,

  answerSql: `
    SELECT b.judul, a.nama, COALESCE(a.email, '-') AS email
    FROM pengembalian r
    JOIN buku b ON b.id = r.buku_id
    JOIN anggota a ON a.id = r.anggota_id
    WHERE r.tgl_kembali IS NULL
    ORDER BY r.tgl_pinjam;
  `,
};
