// src/cases/06-missing-manuscript/story.ts
import type { CaseData } from "../../types/case.types";

export const missingManuscriptCase: CaseData = {
  id: "06-missing-manuscript",
  title: "The Missing Manuscript",
  date: "25 Oktober 2026",
  meta: {
    number: "06",
    location: "Perpustakaan Universitas",
    level: 5,
    levelLabel: "Sangat sulit",
    summary:
      "Manuskrip kuno 'Codex Nusantara' lenyap dari Ruang Koleksi Khusus. Telusuri semua jejak yang tersisa dan temukan pelakunya.",
    skills: ["JOIN", "SUBQUERY", "GROUP BY"],
  },
  briefing:
    "Manuskrip kuno abad ke-15 'Codex Nusantara' lenyap tanpa jejak kerusakan fisik dari Ruang Koleksi Khusus Perpustakaan Universitas. Kartu akses Dr. Hendra dilaporkan hilang sehari sebelum kejadian. Telusuri database untuk mengetahui siapa yang memakai kartu itu, lalu isi formulir laporan.",

  // Petunjuk untuk pengusutan
  hints: [
    "Dr. Hendra melapor kartunya hilang tanggal 24 Oktober. Cari kartu itu di access_logs pada 25 Oktober malam.",
    "Cari tahu siapa yang berada di ruang bimbingan saat kartu hilang, dan siapa yang masih meminjam buku sistem kunci atau katalog manuskrip.",
  ],

  // Barang bukti fisik / dokumen di TKP
  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_BukuSatpam",
      title: "Catatan Jam Jaga Satpam",
      category: "document",
      dateOrTag: "25 Okt 2026",
      content:
        "Catatan Petugas: Pintu Ruang Koleksi Khusus terkunci otomatis pukul 20:00. Hanya pemegang kartu akses berwenang yang bisa masuk.",
    },
    {
      id: "clue-02",
      objectName: "Mesh_KartuHilang",
      title: "Laporan Kehilangan CRD-8801",
      category: "evidence",
      dateOrTag: "24 Okt 2026",
      content:
        "Dr. Hendra melaporkan kartu aksesnya (CRD-8801) hilang di ruang bimbingan skripsi Fakultas Sejarah setelah konsultasi dengan mahasiswa.",
    },
  ],

  // Kunci jawaban kasus (dipakai untuk formulir laporan)
  solution: {
    culpritId: 103, // Bagas Pratama
    stolenCardId: "CRD-8801", // Kartu Dr. Hendra yang dicuri
    evidenceBookId: "BK-002", // Buku Denah & Sistem Kunci
  },

  // Seed Data SQL
  schemaSql: `
    CREATE TABLE members (
        member_id INT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        department VARCHAR(50) NOT NULL,
        card_id VARCHAR(20) UNIQUE NOT NULL,
        physical_note TEXT
    );

    CREATE TABLE books (
        book_id VARCHAR(20) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        location VARCHAR(50) NOT NULL
    );

    CREATE TABLE borrowing_records (
        record_id INT PRIMARY KEY,
        member_id INT NOT NULL,
        book_id VARCHAR(20) NOT NULL,
        borrow_date DATE NOT NULL,
        return_date DATE
    );

    CREATE TABLE access_logs (
        log_id INT PRIMARY KEY,
        card_id VARCHAR(20) NOT NULL,
        room_name VARCHAR(50) NOT NULL,
        access_date DATE NOT NULL,
        entry_time TIME NOT NULL,
        exit_time TIME NOT NULL,
        status VARCHAR(20) NOT NULL
    );

    CREATE TABLE security_reports (
        report_id INT PRIMARY KEY,
        member_id INT NOT NULL,
        report_date DATE NOT NULL,
        report_time TIME NOT NULL,
        description TEXT NOT NULL
    );

    INSERT INTO members VALUES
    (101, 'Dr. Hendra Wijaya', 'Dosen', 'Sejarah', 'CRD-8801', 'Pria paruh baya, berkacamata baca, rambut beruban'),
    (102, 'Siti Nabila', 'Mahasiswa', 'Sastra Kuno', 'CRD-8802', 'Wanita, tidak berkacamata, sering membawa tas tabung peta'),
    (103, 'Bagas Pratama', 'Mahasiswa', 'Sejarah', 'CRD-8803', 'Pria, berkacamata baca tebal, jaket almamater merah Fakultas Sejarah'),
    (104, 'Rina Kusuma', 'Staf', 'Manajemen Perpustakaan', 'CRD-8804', 'Wanita, berkacamata minus, seragam staf perpustakaan'),
    (105, 'Dimas Anggara', 'Mahasiswa', 'Teknik Informatika', 'CRD-8805', 'Pria, tidak berkacamata, jaket hoodie hitam'),
    (106, 'Prof. Aris Munandar', 'Dosen', 'Arkeologi', 'CRD-8806', 'Pria tua, berkacamata baca, menggunakan tongkat jalan');

    INSERT INTO books VALUES
    ('BK-001', 'Pengantar Sejarah Asia Tenggara', 'Sejarah', 'Rak Umum A1'),
    ('BK-002', 'Denah & Sistem Kunci Ruang Koleksi Kuno', 'Arsitektur & Keamanan', 'Rak Referensi B4'),
    ('BK-003', 'Katalog Manuskrip Abad ke-15: Codex Nusantara', 'Filologi', 'Rak Referensi B2'),
    ('BK-004', 'Algoritma Kriptografi Modern', 'Ilmu Komputer', 'Rak Umum C3'),
    ('BK-005', 'Panduan Konservasi Kertas Lontar dan Perkamen', 'Konservasi', 'Rak Referensi B1');

    INSERT INTO borrowing_records VALUES
    (1, 102, 'BK-005', '2026-10-15', '2026-10-20'),
    (2, 105, 'BK-004', '2026-10-18', '2026-10-24'),
    (3, 103, 'BK-002', '2026-10-21', NULL),
    (4, 103, 'BK-003', '2026-10-22', NULL),
    (5, 101, 'BK-001', '2026-10-10', '2026-10-17'),
    (6, 106, 'BK-003', '2026-10-01', '2026-10-08');

    INSERT INTO access_logs VALUES
    (5001, 'CRD-8804', 'Ruang Koleksi Khusus', '2026-10-25', '18:30:00', '19:00:00', 'GRANTED'),
    (5002, 'CRD-8805', 'Ruang Baca Utama',     '2026-10-25', '19:15:00', '21:30:00', 'GRANTED'),
    (5003, 'CRD-8801', 'Ruang Koleksi Khusus', '2026-10-25', '20:42:00', '20:58:00', 'GRANTED'),
    (5004, 'CRD-8802', 'Ruang Koleksi Khusus', '2026-10-25', '21:10:00', '21:10:00', 'DENIED'),
    (5005, 'CRD-8803', 'Ruang Baca Utama',    '2026-10-25', '19:30:00', '20:30:00', 'GRANTED');

    INSERT INTO security_reports VALUES
    (901, 102, '2026-10-12', '10:00:00', 'Melaporkan kehilangan payung hitam di loker penitipan barang.'),
    (902, 101, '2026-10-24', '14:30:00', 'Dr. Hendra melaporkan kartu aksesnya (CRD-8801) hilang terjatuh di ruang bimbingan skripsi Fakultas Sejarah setelah sesi konsultasi dengan mahasiswa.'),
    (903, 103, '2026-10-24', '15:10:00', 'Petugas melihat Bagas Pratama menjadi mahasiswa terakhir yang keluar dari ruang bimbingan skripsi Dr. Hendra, beberapa menit setelah sesi konsultasi selesai.');
  `,

  // Formulir laporan akhir (menggantikan answerSql)
  report: {
    fields: [
      {
        key: "pelaku",
        label: "Siapa pelaku pencurian manuskrip?",
        hint: "Pikirkan siapa yang berada dekat kartu saat hilang, lalu siapa yang masuk Ruang Koleksi malam itu.",
        options: [
          { value: "101", label: "Dr. Hendra Wijaya" },
          { value: "102", label: "Siti Nabila" },
          { value: "103", label: "Bagas Pratama" },
          { value: "104", label: "Rina Kusuma" },
          { value: "105", label: "Dimas Anggara" },
          { value: "106", label: "Prof. Aris Munandar" },
        ],
      },
      {
        key: "kartu",
        label: "Kartu siapa yang dicuri dan dipakai masuk Ruang Koleksi?",
        options: [
          { value: "CRD-8801", label: "CRD-8801 — Dr. Hendra Wijaya" },
          { value: "CRD-8802", label: "CRD-8802 — Siti Nabila" },
          { value: "CRD-8803", label: "CRD-8803 — Bagas Pratama" },
          { value: "CRD-8804", label: "CRD-8804 — Rina Kusuma" },
          { value: "CRD-8805", label: "CRD-8805 — Dimas Anggara" },
          { value: "CRD-8806", label: "CRD-8806 — Prof. Aris Munandar" },
        ],
      },
      {
        key: "buku",
        label: "Buku mana yang dipinjam pelaku untuk mempelajari sistem kunci?",
        options: [
          { value: "BK-001", label: "Pengantar Sejarah Asia Tenggara" },
          { value: "BK-002", label: "Denah & Sistem Kunci Ruang Koleksi Kuno" },
          {
            value: "BK-003",
            label: "Katalog Manuskrip Abad ke-15: Codex Nusantara",
          },
          { value: "BK-004", label: "Algoritma Kriptografi Modern" },
          {
            value: "BK-005",
            label: "Panduan Konservasi Kertas Lontar dan Perkamen",
          },
        ],
      },
    ],
    answer: {
      pelaku: "103",
      kartu: "CRD-8801",
      buku: "BK-002",
    },
    successMessage:
      "Bagas Pratama ditetapkan sebagai pelaku. Codex Nusantara akan segera dicari.",
  },
};
