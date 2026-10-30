// Chapter 5: Denah yang Tersembunyi (tingkat sulit)
import type { CaseData } from "@/types/case.types";

export const denahTersembunyiCase: CaseData = {
  id: "05-denah-tersembunyi",
  title: "Denah yang Tersembunyi",
  date: "28 Oktober 2026",
  meta: {
    number: "05",
    location: "Ruang Arsip Denah",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Denah lama ternyata dipinjam dengan cara yang tidak biasa. Susun ulang rangkaian peminjamannya.",
    skills: ["WITH", "CASE", "UNION"],
  },
  briefing:
    "Denah Kota Lama Batavia tidak lagi tercatat di rak, dan riwayat peminjamannya tidak lengkap. Susun ulang seluruh kejadian untuk buku BK-DNH: siapa yang meminjam, mengembalikan, dan menerima buku dari orang lain, diurutkan menurut tanggal. Tampilkan tanggal, nama anggota, dan keterangan kejadiannya.",

  cheatJoin: {
    a: "peminjaman",
    aKey: "anggota_id",
    b: "anggota",
    bKey: "anggota_id",
  },
  hints: [
    "Riwayat denah berasal dari dua sumber: tabel peminjaman (untuk pinjam dan kembali) dan pindah_tangan. Gabungkan keduanya dengan UNION ALL di dalam WITH.",
    "Tentukan jenis setiap kejadian dengan CASE, lalu ambil nama anggotanya dengan JOIN ke tabel anggota.",
  ],

  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_CatatanArsip",
      title: "Catatan Ruang Arsip",
      category: "document",
      dateOrTag: "11 Okt 2026",
      content:
        "Denah Kota Lama sempat berpindah tangan tanpa lewat meja sirkulasi. Tidak semua perpindahan tercatat di formulir peminjaman.",
    },
    {
      id: "clue-02",
      objectName: "Mesh_DenahLama",
      title: "Denah Kota Lama (fisik)",
      category: "evidence",
      dateOrTag: "11 Okt 2026",
      content:
        "Kertas denah ditemukan dengan stempel Ruang Arsip Denah di sudut kanan. Lipatannya baru, seperti sering dibawa keluar masuk.",
    },
  ],

  schemaSql: `
    CREATE TABLE anggota (
        anggota_id INT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        peran VARCHAR(50) NOT NULL
    );

    CREATE TABLE buku (
        buku_id VARCHAR(20) PRIMARY KEY,
        judul VARCHAR(150) NOT NULL,
        koleksi VARCHAR(50) NOT NULL
    );

    CREATE TABLE peminjaman (
        pinjam_id INT PRIMARY KEY,
        buku_id VARCHAR(20) NOT NULL,
        anggota_id INT NOT NULL,
        tgl_pinjam DATE NOT NULL,
        tgl_kembali DATE
    );

    CREATE TABLE pindah_tangan (
        pindah_id INT PRIMARY KEY,
        buku_id VARCHAR(20) NOT NULL,
        dari_anggota INT NOT NULL,
        ke_anggota INT NOT NULL,
        tanggal DATE NOT NULL
    );

    INSERT INTO anggota VALUES
    (401, 'Rudi Hartono',     'Mahasiswa'),
    (402, 'Sekar Ayu',        'Asisten Dosen'),
    (403, 'Bagus Wicaksono',  'Mahasiswa'),
    (404, 'Mira Oktaviani',   'Dosen'),
    (405, 'Pak Yanto',        'Staf Arsip');

    INSERT INTO buku VALUES
    ('BK-DNH', 'Denah Kota Lama Batavia, 1820', 'Arsip Peta'),
    ('BK-010', 'Peta Pelabuhan Sunda Kelapa',   'Arsip Peta');

    INSERT INTO peminjaman VALUES
    (1, 'BK-DNH', 401, '2026-09-01', '2026-09-15'),
    (2, 'BK-010', 403, '2026-09-20', '2026-09-27'),
    (3, 'BK-DNH', 402, '2026-10-02', NULL);

    INSERT INTO pindah_tangan VALUES
    (1, 'BK-DNH', 402, 403, '2026-10-05'),
    (2, 'BK-DNH', 403, 404, '2026-10-11'),
    (3, 'BK-010', 405, 403, '2026-10-03');
  `,

  // Kunci validasi: 5 kejadian untuk BK-DNH, tanpa buku lain
  answerSql: `
    WITH riwayat AS (
      SELECT tgl_pinjam AS tanggal, anggota_id, 'P' AS jenis
      FROM peminjaman
      WHERE buku_id = 'BK-DNH'
      UNION ALL
      SELECT tgl_kembali, anggota_id, 'K'
      FROM peminjaman
      WHERE buku_id = 'BK-DNH' AND tgl_kembali IS NOT NULL
      UNION ALL
      SELECT tanggal, ke_anggota, 'H'
      FROM pindah_tangan
      WHERE buku_id = 'BK-DNH'
    )
    SELECT r.tanggal,
           a.nama,
           CASE r.jenis
             WHEN 'P' THEN 'Dipinjam'
             WHEN 'K' THEN 'Dikembalikan'
             ELSE 'Pindah tangan'
           END AS keterangan
    FROM riwayat r
    JOIN anggota a ON a.anggota_id = r.anggota_id
    ORDER BY r.tanggal;
  `,
};
