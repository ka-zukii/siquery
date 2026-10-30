// Chapter 20: Pemilik Sebenarnya (investigasi, tingkat sangat sulit, kasus penutup)
import type { CaseData } from "@/types/case.types";

export const pemilikSebenarnyaCase: CaseData = {
  id: "20-pemilik-sebenarnya",
  title: "Pemilik Sebenarnya",
  date: "11 November 2026",
  meta: {
    number: "20",
    location: "Ruang Koleksi Khusus",
    level: 5,
    levelLabel: "Sangat sulit",
    summary:
      "Ruang koleksi khusus dibuka tengah malam dengan kartu yang sudah dicabut. Lacak riwayat serah terima kartu untuk menemukan siapa yang sebenarnya masuk.",
    skills: ["JOIN", "Subquery", "Investigasi lintas tabel"],
  },
  briefing:
    "Pada 1 November pukul 23.10, Ruang Koleksi Khusus dibuka dengan kartu K-101. Kartu itu atas nama Sinta, yang sudah tidak aktif di kampus. Susun riwayat kartu, akses ruangan, dan serah terima kartu, lalu tentukan siapa yang memegang kartu itu malam itu.",

  hints: [
    "Cari kartu K-101 di tabel akses_ruangan, lalu cari riwayatnya di serah_terima_kartu.",
    "Pemilik kartu di catatan lama belum tentu orang yang memegangnya malam itu. Lihat tanggal serah terima terakhir.",
  ],

  emails: [
    {
      id: "mail-20-1",
      from: "keamanan@library.univ.ac.id",
      to: "kepala@library.univ.ac.id",
      subject: "Pintu koleksi khusus terbuka tengah malam",
      date: "2026-11-02",
      body: "Kartu K-101 tercatat masuk Ruang Koleksi Khusus pukul 23.10. Kartu itu seharusnya sudah dicabut sejak Sinta keluar kampus.",
    },
  ],

  schemaSql: `
    CREATE TABLE anggota (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL
    );

    INSERT INTO anggota VALUES
    (301, 'Sinta Maharani', 'NONAKTIF'),
    (302, 'Rafi Hidayat', 'AKTIF'),
    (303, 'Mira Lestari', 'AKTIF');

    CREATE TABLE kartu_akses (
      card_id VARCHAR(10) PRIMARY KEY,
      anggota_id INT NOT NULL,
      status VARCHAR(20) NOT NULL
    );

    INSERT INTO kartu_akses VALUES
    ('K-101', 301, 'DICABUT'),
    ('K-102', 302, 'AKTIF'),
    ('K-103', 303, 'AKTIF');

    CREATE TABLE serah_terima_kartu (
      id INT PRIMARY KEY,
      card_id VARCHAR(10) NOT NULL,
      dari_anggota_id INT NOT NULL,
      ke_anggota_id INT NOT NULL,
      tanggal DATE NOT NULL
    );

    INSERT INTO serah_terima_kartu VALUES
    (1, 'K-101', 301, 302, '2026-09-15'),
    (2, 'K-101', 302, 303, '2026-10-30'),
    (3, 'K-102', 302, 302, '2026-10-01');

    CREATE TABLE akses_ruangan (
      id INT PRIMARY KEY,
      card_id VARCHAR(10) NOT NULL,
      waktu VARCHAR(16) NOT NULL,
      ruangan VARCHAR(50) NOT NULL,
      hasil VARCHAR(10) NOT NULL
    );

    INSERT INTO akses_ruangan VALUES
    (1, 'K-102', '2026-10-31 19:00', 'Pintu Utama', 'DITERIMA'),
    (2, 'K-101', '2026-10-30 08:12', 'Pintu Utama', 'DITOLAK'),
    (3, 'K-101', '2026-11-01 23:10', 'Koleksi Khusus', 'DITERIMA'),
    (4, 'K-103', '2026-11-01 23:08', 'Pintu Utama', 'DITERIMA');
  `,

  report: {
    fields: [
      {
        key: "kartu",
        label: "Kartu mana yang dipakai untuk membuka Ruang Koleksi Khusus?",
        hint: "Lihat akses_ruangan yang DITERIMA di ruangan Koleksi Khusus.",
        options: [
          { value: "k101", label: "K-101" },
          { value: "k102", label: "K-102" },
          { value: "k103", label: "K-103" },
        ],
      },
      {
        key: "pelaku",
        label: "Siapa yang memegang kartu itu malam itu?",
        hint: "Kartu itu sudah berpindah tangan. Lihat serah terima yang paling baru.",
        options: [
          { value: "sinta", label: "Sinta Maharani" },
          { value: "rafi", label: "Rafi Hidayat" },
          { value: "mira", label: "Mira Lestari" },
        ],
      },
    ],
    answer: { kartu: "k101", pelaku: "mira" },
    successMessage:
      "Mira Lestari menerima K-101 dari Rafi pada 30 Oktober, lalu memakainya untuk masuk Ruang Koleksi Khusus pada 1 November.",
  },
};
