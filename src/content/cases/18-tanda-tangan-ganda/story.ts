// Chapter 18: Tanda Tangan Ganda (investigasi, tingkat sulit)
import type { CaseData } from "@/types/case.types";

export const tandaTanganGandaCase: CaseData = {
  id: "18-tanda-tangan-ganda",
  title: "Tanda Tangan Ganda",
  date: "9 November 2026",
  meta: {
    number: "18",
    location: "Meja Sirkulasi Sore",
    level: 5,
    levelLabel: "Sangat sulit",
    summary:
      "Satu buku tercatat dipinjam dua kali pada hari yang sama. Telusuri entri peminjaman manual untuk mengetahui siapa yang memasukkan catatan palsu.",
    skills: ["GROUP BY", "HAVING", "JOIN", "Investigasi"],
  },
  briefing:
    "Buku Arsip Kerajaan tercatat dipinjam dua kali pada 25 Oktober, oleh dua anggota berbeda. Buku itu hanya ada satu di rak. Telusuri catatan peminjaman, lalu tentukan petugas mana yang memasukkan entri ganda itu tanpa ada buku yang benar-benar keluar.",

  hints: [
    "Hitung berapa kali setiap buku tercatat per tanggal dengan GROUP BY buku_id, tanggal, lalu filter HAVING COUNT(*) > 1.",
    "Setelah tahu entri gandanya, lihat kolom petugas_id untuk melihat siapa yang mencatatnya.",
  ],

  emails: [
    {
      id: "mail-18-1",
      from: "sirkulasi@library.univ.ac.id",
      to: "kepala@library.univ.ac.id",
      subject: "Buku Arsip Kerajaan tercatat dua kali",
      date: "2026-10-26",
      body: "Ada dua peminjaman untuk Arsip Kerajaan tanggal 25 Oktober, tapi bukunya cuma ada satu di rak. Tolong cek siapa yang input.",
    },
  ],

  schemaSql: `
    CREATE TABLE petugas (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL
    );

    INSERT INTO petugas VALUES
    (1, 'Rina Kusuma'),
    (2, 'Yoga Permana');

    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL
    );

    INSERT INTO buku VALUES
    (5, 'Arsip Kerajaan'),
    (7, 'Kebun Sunyi');

    CREATE TABLE peminjaman (
      id INT PRIMARY KEY,
      buku_id INT NOT NULL,
      anggota_id INT NOT NULL,
      petugas_id INT NOT NULL,
      tanggal DATE NOT NULL
    );

    INSERT INTO peminjaman VALUES
    (1, 5, 201, 1, '2026-10-25'),
    (2, 5, 202, 2, '2026-10-25'),
    (3, 7, 201, 1, '2026-10-24'),
    (4, 7, 203, 1, '2026-10-26');
  `,

  report: {
    fields: [
      {
        key: "petugas",
        label: "Petugas mana yang memasukkan entri peminjaman ganda untuk Arsip Kerajaan?",
        hint: "Entri ganda adalah yang kedua. Lihat petugas_id pada entri itu.",
        options: [
          { value: "rina", label: "Rina Kusuma" },
          { value: "yoga", label: "Yoga Permana" },
        ],
      },
    ],
    answer: { petugas: "yoga" },
    successMessage:
      "Entri kedua untuk Arsip Kerajaan dibuat oleh Yoga Permana. Buku itu tidak pernah keluar dari rak pada tanggal tersebut.",
  },
};
