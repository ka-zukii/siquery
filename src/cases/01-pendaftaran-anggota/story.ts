// Chapter 1: Pendaftaran Anggota Baru (tingkat mudah)
import type { CaseData } from "../../types/case.types";

export const pendaftaranAnggotaCase: CaseData = {
  id: "01-pendaftaran-anggota",
  title: "Pendaftaran Anggota Baru",
  date: "25 Oktober 2026",
  briefing:
    "Pendaftaran anggota baru dibuka minggu ini. Verifikasi kartu dilakukan petugas, tetapi ada pendaftar yang belum diproses. Tampilkan semua pendaftar yang masih MENUNGGU, lalu cari satu yang berasal dari Fakultas Sejarah.",

  meta: {
    number: "01",
    location: "Meja Layanan Anggota",
    level: 1,
    levelLabel: "Dasar",
    summary:
      "Kepala layanan minta daftar pendaftar yang belum diverifikasi. Cari pendaftar dari Fakultas Sejarah yang masih menunggu.",
    skills: ["SELECT", "WHERE", "AND", "ORDER BY"],
  },

  hints: ["Gunakan WHERE dengan dua kondisi yang digabung AND."],

  schemaSql: `
    CREATE TABLE anggota_baru (
        id INT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        fakultas VARCHAR(50) NOT NULL,
        nim VARCHAR(20) UNIQUE NOT NULL,
        card_id VARCHAR(20) UNIQUE NOT NULL,
        tanggal_daftar DATE NOT NULL,
        status VARCHAR(20) NOT NULL
    );

    INSERT INTO anggota_baru VALUES
    (1, 'Salsa Nirmala',  'Sastra Kuno',        '2610045', 'CRD-8810', '2026-10-22', 'AKTIF'),
    (2, 'Yoga Prasetyo',  'Teknik Informatika', '2610046', 'CRD-8811', '2026-10-23', 'AKTIF'),
    (3, 'Anisa Rahma',    'Sejarah',            '2610047', 'CRD-8812', '2026-10-24', 'MENUNGGU'),
    (4, 'Fajar Ilham',    'Arkeologi',          '2610048', 'CRD-8813', '2026-10-25', 'MENUNGGU'),
    (5, 'Lestari Ayu',    'Sejarah',            '2610049', 'CRD-8814', '2026-10-25', 'AKTIF'),
    (6, 'Rizky Maulana',  'Teknik Informatika', '2610050', 'CRD-8815', '2026-10-25', 'DITOLAK');
  `,

  // Kunci validasi: kueri pemain harus memuat baris ini
  answerSql: `
    SELECT nama, nim, card_id
    FROM anggota_baru
    WHERE status = 'MENUNGGU'
      AND fakultas = 'Sejarah';
  `,
};
