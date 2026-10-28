// Chapter 2: Kartu yang Masih Aktif (tingkat dasar-menengah)
import type { CaseData } from "../../types/case.types";

export const kartuAktifCase: CaseData = {
  id: "02-kartu-aktif",
  title: "Kartu yang Masih Aktif",
  date: "26 Oktober 2026",
  meta: {
    number: "02",
    location: "Meja Verifikasi Kartu",
    level: 2,
    levelLabel: "Dasar-menengah",
    summary:
      "Beberapa kartu lama belum dinonaktifkan. Hitung dan kelompokkan pemakaiannya untuk menemukan kartu yang mencurigakan.",
    skills: ["COUNT", "GROUP BY", "HAVING"],
  },
  briefing:
    "Petugas verifikasi menemukan beberapa kartu lama yang masih berstatus AKTIF. Tampilkan kartu AKTIF yang berhasil masuk (DITERIMA) minimal 3 kali, beserta jumlah masuknya.",

  hints: [
    "Hitung jumlah pindai per kartu dengan COUNT(*), lalu kelompokkan dengan GROUP BY card_id.",
    "WHERE menyaring baris sebelum dikelompokkan, sedangkan HAVING menyaring grup setelah dihitung.",
  ],

  schemaSql: `
    CREATE TABLE kartu_akses (
        card_id VARCHAR(20) PRIMARY KEY,
        pemilik VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        tanggal_terbit DATE NOT NULL
    );

    CREATE TABLE riwayat_pindai (
        scan_id INT PRIMARY KEY,
        card_id VARCHAR(20) NOT NULL,
        ruangan VARCHAR(50) NOT NULL,
        tanggal DATE NOT NULL,
        jam TIME NOT NULL,
        hasil VARCHAR(20) NOT NULL
    );

    INSERT INTO kartu_akses VALUES
    ('CRD-7001', 'Maya Lestari',    'AKTIF',    '2025-08-01'),
    ('CRD-7002', 'Andi Saputra',    'NONAKTIF', '2024-02-14'),
    ('CRD-7003', 'Dewi Anggraini',  'AKTIF',    '2025-09-10'),
    ('CRD-7004', 'Rafi Hidayat',    'AKTIF',    '2026-01-05'),
    ('CRD-7005', 'Nadia Putri',     'AKTIF',    '2025-11-20'),
    ('CRD-7006', 'Bima Setiawan',   'NONAKTIF', '2023-07-30');

    INSERT INTO riwayat_pindai VALUES
    (1,  'CRD-7001', 'Pintu Utama',     '2026-10-20', '08:05:00', 'DITERIMA'),
    (2,  'CRD-7003', 'Pintu Utama',     '2026-10-20', '08:10:00', 'DITERIMA'),
    (3,  'CRD-7001', 'Ruang Baca',      '2026-10-20', '09:00:00', 'DITERIMA'),
    (4,  'CRD-7004', 'Pintu Utama',     '2026-10-20', '09:30:00', 'DITOLAK'),
    (5,  'CRD-7001', 'Ruang Koleksi',   '2026-10-21', '10:00:00', 'DITOLAK'),
    (6,  'CRD-7002', 'Pintu Utama',     '2026-10-21', '10:15:00', 'DITERIMA'),
    (7,  'CRD-7003', 'Ruang Baca',      '2026-10-21', '11:00:00', 'DITERIMA'),
    (8,  'CRD-7004', 'Pintu Utama',     '2026-10-21', '11:30:00', 'DITERIMA'),
    (9,  'CRD-7001', 'Pintu Utama',     '2026-10-22', '08:02:00', 'DITERIMA'),
    (10, 'CRD-7005', 'Ruang Baca',      '2026-10-22', '13:00:00', 'DITERIMA'),
    (11, 'CRD-7006', 'Ruang Koleksi',   '2026-10-22', '14:00:00', 'DITOLAK'),
    (12, 'CRD-7004', 'Ruang Baca',      '2026-10-23', '15:00:00', 'DITERIMA'),
    (13, 'CRD-7005', 'Pintu Utama',     '2026-10-23', '08:20:00', 'DITERIMA'),
    (14, 'CRD-7004', 'Pintu Utama',     '2026-10-24', '08:40:00', 'DITERIMA'),
    (15, 'CRD-7006', 'Pintu Utama',     '2026-10-24', '09:00:00', 'DITERIMA'),
    (16, 'CRD-7002', 'Ruang Baca',      '2026-10-24', '10:00:00', 'DITERIMA'),
    (17, 'CRD-7002', 'Pintu Utama',     '2026-10-25', '11:00:00', 'DITERIMA'),
    (18, 'CRD-7002', 'Ruang Baca',      '2026-10-25', '12:00:00', 'DITERIMA'),
    (19, 'CRD-7003', 'Pintu Utama',     '2026-10-25', '08:30:00', 'DITERIMA');
  `,

  // Kunci validasi: kueri pemain harus memuat baris ini
  answerSql: `
    SELECT card_id, COUNT(*) AS jumlah
    FROM riwayat_pindai
    WHERE hasil = 'DITERIMA'
      AND card_id IN (SELECT card_id FROM kartu_akses WHERE status = 'AKTIF')
    GROUP BY card_id
    HAVING COUNT(*) >= 3;
  `,
};
