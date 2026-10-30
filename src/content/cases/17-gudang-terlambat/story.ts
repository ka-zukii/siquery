// Chapter 17: Gudang yang Terkunci Terlambat (investigasi, tingkat menengah)
import type { CaseData } from "@/types/case.types";

export const gudangTerlambatCase: CaseData = {
  id: "17-gudang-terlambat",
  title: "Gudang yang Terkunci Terlambat",
  date: "8 November 2026",
  meta: {
    number: "17",
    location: "Gudang Arsip",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Kunci gudang arsip sempat dibuka setelah jam kerja. Cocokkan jam akses dengan jadwal shift untuk menemukan petugas yang tidak seharusnya ada di sana.",
    skills: ["JOIN", "Perbandingan waktu", "Investigasi"],
  },
  briefing:
    "Pada 28 Oktober, pintu gudang arsip terbuka dua kali setelah jam shift berakhir. Log kartu tercatat, tetapi tidak ada yang mengaku. Gunakan DB Studio untuk mencocokkan waktu akses dengan jam selesai shift setiap petugas, lalu tentukan siapa yang membuka pintu di luar jam kerjanya.",

  hints: [
    "Gabungkan akses_gudang dengan petugas lewat petugas_id, lalu bandingkan waktu akses dengan shift_selesai.",
    "Perhatikan hanya akses yang DITERIMA. Akses yang DITOLAK tidak membuka pintu.",
  ],

  emails: [
    {
      id: "mail-17-1",
      from: "kepala@library.univ.ac.id",
      to: "semua.petugas@library.univ.ac.id",
      subject: "Kunci gudang arsip",
      date: "2026-10-29",
      body: "Kunci cadangan gudang arsip tidak ada di laci. Tolong pastikan semua yang meminjamnya melapor hari ini.",
    },
  ],

  schemaSql: `
    CREATE TABLE petugas (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      shift_selesai VARCHAR(5) NOT NULL
    );

    INSERT INTO petugas VALUES
    (1, 'Hendra Saputra', '16:00'),
    (2, 'Lia Ananda', '17:00'),
    (3, 'Bagas Pratama', '22:00');

    CREATE TABLE akses_gudang (
      id INT PRIMARY KEY,
      petugas_id INT NOT NULL,
      waktu VARCHAR(16) NOT NULL,
      hasil VARCHAR(10) NOT NULL
    );

    INSERT INTO akses_gudang VALUES
    (1, 2, '2026-10-28 16:50', 'DITERIMA'),
    (2, 3, '2026-10-28 21:30', 'DITERIMA'),
    (3, 1, '2026-10-28 17:20', 'DITERIMA'),
    (4, 1, '2026-10-28 17:24', 'DITERIMA'),
    (5, 2, '2026-10-28 18:40', 'DITOLAK'),
    (6, 1, '2026-10-29 08:05', 'DITERIMA');
  `,

  report: {
    fields: [
      {
        key: "pelaku",
        label: "Siapa yang membuka gudang arsip setelah jam shift-nya berakhir?",
        hint: "Bandingkan jam akses yang DITERIMA dengan jam selesai shift.",
        options: [
          { value: "hendra", label: "Hendra Saputra" },
          { value: "lia", label: "Lia Ananda" },
          { value: "bagas", label: "Bagas Pratama" },
        ],
      },
    ],
    answer: { pelaku: "hendra" },
    successMessage:
      "Hendra Saputra masih membuka gudang dua kali setelah shift-nya selesai pukul 16.00. Kunci hilang di jam itu.",
  },
};
