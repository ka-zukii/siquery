// Chapter 8: Denda yang Tak Pernah Dibayar (tingkat menengah)
import type { CaseData } from "../../types/case.types";

export const dendaTakDibayarCase: CaseData = {
  id: "08-denda-tak-dibayar",
  title: "Denda yang Tak Pernah Dibayar",
  date: "30 Oktober 2026",
  meta: {
    number: "08",
    location: "Meja Pengembalian",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Bendahara menemukan denda yang belum lunas, tetapi laporannya tidak lengkap. Tampilkan total denda yang belum dibayar untuk setiap anggota.",
    skills: ["LEFT JOIN", "SUM", "COALESCE"],
  },
  briefing:
    "Bendahara perpustakaan menemukan selisih di buku denda bulan ini. Tampilkan setiap anggota beserta total denda yang masih berstatus BELUM, termasuk anggota yang tidak punya denda sama sekali (tampilkan 0).",

  hints: [
    "Mulai dari tabel anggota, lalu gabungkan dengan denda dengan LEFT JOIN supaya semua anggota tetap tampil.",
    "Letakkan syarat status = 'BELUM' di dalam ON, bukan di WHERE. Kalau di WHERE, anggota tanpa denda ikut hilang.",
  ],

  emails: [
    {
      id: "mail-bendahara",
      from: "bendahara@library.univ.ac.id",
      to: "detective@siquery.os",
      subject: "Denda Oktober belum rapi",
      date: "30 Okt 2026",
      body: "Ada beberapa anggota yang belum melunasi denda bulan ini. Tolong cek ulang totalnya sebelum laporan ditutup.",
    },
  ],

  schemaSql: `
    CREATE TABLE anggota (
        anggota_id INT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL
    );

    CREATE TABLE denda (
        denda_id INT PRIMARY KEY,
        anggota_id INT NOT NULL,
        jumlah INT NOT NULL,
        status VARCHAR(10) NOT NULL
    );

    INSERT INTO anggota VALUES
    (501, 'Tomi Saputra'),
    (502, 'Lia Permata'),
    (503, 'Ardi Nugroho'),
    (504, 'Sari Wulandari');

    INSERT INTO denda VALUES
    (1, 501, 15000, 'BELUM'),
    (2, 501,  5000, 'LUNAS'),
    (3, 502, 20000, 'BELUM'),
    (4, 503, 10000, 'BELUM'),
    (5, 503, 10000, 'BELUM');
  `,

  // Kunci validasi: 4 anggota, termasuk Sari dengan total 0
  answerSql: `
    SELECT a.nama, COALESCE(SUM(d.jumlah), 0) AS total_belum_bayar
    FROM anggota a
    LEFT JOIN denda d
      ON d.anggota_id = a.anggota_id
     AND d.status = 'BELUM'
    GROUP BY a.anggota_id, a.nama;
  `,
};
