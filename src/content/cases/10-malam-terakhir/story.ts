// Chapter 10: Malam Terakhir (tingkat sangat sulit, diselesaikan lewat laporan)
import type { CaseData } from "@/types/case.types";

export const malamTerakhirCase: CaseData = {
  id: "10-malam-terakhir",
  title: "Malam Terakhir",
  date: "1 November 2026",
  meta: {
    number: "10",
    location: "Ruang Koleksi Khusus",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Kunci cadangan sudah bocor, dan malam itu ruang koleksi dibuka sebentar. Susun semua petunjuk untuk menemukan dalangnya.",
    skills: ["JOIN", "SUBQUERY", "GROUP BY"],
  },
  briefing:
    "Kunci cadangan bocor, lalu malam itu Ruang Koleksi Khusus dibuka sebentar. Susun semua petunjuk dari email, log akses, dan barang bukti. Tentukan siapa dalangnya dan kartu mana yang dipakai untuk masuk.",

  cheatJoin: {
    a: "email_log",
    aKey: "dari",
    b: "akses_ruangan",
    bKey: "nama",
    on: "b.nama LIKE '%' || <bagian nama dari a.dari> || '%'",
  },
  hints: [
    "Gabungkan email dengan log akses lewat nama anggota, lalu lihat siapa yang berada di ruangan tanpa alasan yang jelas.",
    "Perhatikan waktu. Siapa yang sudah selesai jaga atau pergi lebih dulu, tetapi kartunya tetap tercatat masuk?",
  ],

  emails: [
    {
      id: "mail-kepala-akhir",
      from: "kepala@library.univ.ac.id",
      to: "detective@siquery.os",
      subject: "Kasus terakhir: tutup dengan benar",
      date: "1 Nov 2026",
      body: "Kunci cadangan sudah sampai ke luar kampus. Saya minta laporan akhir lengkap: siapa dalangnya dan kartu apa yang dipakai malam itu.",
    },
  ],

  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_LogAkses",
      title: "Log akses malam 28 Oktober",
      category: "document",
      dateOrTag: "28 Okt 2026",
      content:
        "Kartu CRD-8804 tercatat masuk Ruang Koleksi Khusus pukul 20.50. Jadwal jaga untuk pemilik kartu itu sudah selesai pukul 18.00.",
    },
    {
      id: "clue-02",
      objectName: "Mesh_KunciLaci",
      title: "Laci meja baca",
      category: "evidence",
      dateOrTag: "1 Nov 2026",
      content:
        "Di laci meja baca ada catatan tangan yang berisi jam dan nomor kartu. Bagian bawahnya tertulis 'bukan saya'.",
    },
  ],

  schemaSql: `
    CREATE TABLE email_log (
        email_id INT PRIMARY KEY,
        dari VARCHAR(100) NOT NULL,
        untuk VARCHAR(100) NOT NULL,
        subjek VARCHAR(150) NOT NULL,
        tanggal DATE NOT NULL,
        jam TIME NOT NULL
    );

    CREATE TABLE akses_ruangan (
        log_id INT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        kartu VARCHAR(20) NOT NULL,
        ruangan VARCHAR(50) NOT NULL,
        tanggal DATE NOT NULL,
        jam TIME NOT NULL
    );

    INSERT INTO email_log VALUES
    (1, 'rina.k@library.univ.ac.id',   'dimas.a@students.univ.ac.id', 'Kunci cadangan ruang koleksi', '2026-10-28', '17:40:00'),
    (2, 'dimas.a@students.univ.ac.id', 'anon.7731@mail.net',          'Kunci cadangan ruang koleksi', '2026-10-28', '21:50:00');

    INSERT INTO akses_ruangan VALUES
    (1, 'Rina Kusuma',        'CRD-8804', 'Ruang Koleksi Khusus', '2026-10-28', '20:50:00'),
    (2, 'Dimas Anggara',      'CRD-8805', 'Ruang Baca Utama',     '2026-10-28', '21:00:00'),
    (3, 'Prof. Aris Munandar','CRD-8806', 'Ruang Baca Utama',     '2026-10-28', '19:10:00');
  `,

  // Tanpa answerSql: kasus selesai lewat formulir laporan
  report: {
    fields: [
      {
        key: "pelaku",
        label: "Siapa dalang di balik bocornya kunci cadangan?",
        hint: "Cari siapa yang pertama kali mengirim kunci, lalu cek apakah ia sendiri masuk ruangan malam itu.",
        options: [
          { value: "rina", label: "Rina Kusuma" },
          { value: "dimas", label: "Dimas Anggara" },
          { value: "aris", label: "Prof. Aris Munandar" },
        ],
      },
      {
        key: "kartu",
        label: "Kartu mana yang dipakai masuk Ruang Koleksi Khusus malam itu?",
        options: [
          { value: "CRD-8804", label: "CRD-8804 — Rina Kusuma" },
          { value: "CRD-8805", label: "CRD-8805 — Dimas Anggara" },
          { value: "CRD-8806", label: "CRD-8806 — Prof. Aris Munandar" },
        ],
      },
    ],
    answer: { pelaku: "rina", kartu: "CRD-8804" },
    successMessage:
      "Rina Kusuma mengatur bocornya kunci dan masuk ruang koleksi dengan kartunya sendiri. Kasus malam terakhir resmi ditutup.",
  },
};
