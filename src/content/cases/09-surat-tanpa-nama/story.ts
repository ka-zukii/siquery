// Chapter 9: Surat Tanpa Nama (tingkat sulit, diselesaikan lewat laporan)
import type { CaseData } from "@/types/case.types";

const BRIEFING =
  "Kunci cadangan ruang koleksi khusus bocor ke luar kampus pada malam 28 Oktober. Telusuri log email hari itu, lalu tentukan siapa yang meneruskan kunci ke alamat luar.";

export const suratTanpaNamaCase: CaseData = {
  id: "09-surat-tanpa-nama",
  title: "Surat Tanpa Nama",
  date: "31 Oktober 2026",
  meta: {
    number: "09",
    location: "Kotak Masuk Kepala",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Sebuah email berisi kunci cadangan terkirim ke alamat luar kampus. Telusuri jalur email itu dari awal.",
    skills: ["LIKE", "ORDER BY"],
  },
  briefing: BRIEFING,

  hints: [
    "Cari email yang subjeknya memuat kata 'Kunci' dengan LIKE '%Kunci%'.",
    "Urutkan berdasarkan jam dengan ORDER BY jam untuk melihat urutan kejadiannya.",
  ],

  emails: [
    {
      id: "mail-kepala",
      from: "kepala@library.univ.ac.id",
      to: "detective@siquery.os",
      subject: "Penting: kunci cadangan",
      date: "28 Okt 2026",
      body: BRIEFING,
    },
  ],

  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_GantunganKunci",
      title: "Gantungan kunci cadangan",
      category: "evidence",
      dateOrTag: "28 Okt 2026",
      content:
        "Gantungan kunci cadangan ditemukan di laci meja baca. Ada label tulisan tangan bertuliskan 'Dimas'.",
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

    INSERT INTO email_log VALUES
    (1, 'kepala@library.univ.ac.id',           'staf.sirkulasi@library.univ.ac.id', 'Jadwal rapat minggu ini',           '2026-10-28', '09:00:00'),
    (2, 'rina.k@library.univ.ac.id',           'dimas.a@students.univ.ac.id',       'Kunci cadangan ruang koleksi',      '2026-10-28', '17:40:00'),
    (3, 'dimas.a@students.univ.ac.id',         'rina.k@library.univ.ac.id',         'Re: Kunci cadangan ruang koleksi',  '2026-10-28', '18:05:00'),
    (4, 'dimas.a@students.univ.ac.id',         'anon.7731@mail.net',                'Kunci cadangan ruang koleksi',      '2026-10-28', '21:50:00'),
    (5, 'anon.7731@mail.net',                  'dimas.a@students.univ.ac.id',       'Terima kasih, nanti malam',         '2026-10-28', '21:52:00'),
    (6, 'kepala@library.univ.ac.id',           'rina.k@library.univ.ac.id',         'Kunci cadangan sudah dicek',        '2026-10-27', '11:00:00');
  `,

  // Tanpa answerSql: kasus selesai lewat formulir laporan
  report: {
    fields: [
      {
        key: "pelaku",
        label: "Siapa yang meneruskan kunci cadangan ke alamat luar kampus?",
        hint: "Lihat siapa yang menerima kunci sebelum mengirimnya keluar.",
        options: [
          { value: "rina", label: "Rina Kusuma" },
          { value: "dimas", label: "Dimas Anggara" },
          { value: "aris", label: "Prof. Aris Munandar" },
          { value: "nabila", label: "Siti Nabila" },
        ],
      },
    ],
    answer: { pelaku: "dimas" },
    successMessage:
      "Dimas Anggara meneruskan kunci ke alamat luar sebelum malam itu. Rantai email sudah cukup untuk menutup kasus.",
  },
};
