// Chapter 19: Buku yang Kembali Dua Kali (investigasi, tingkat sulit)
import type { CaseData } from "@/types/case.types";

export const kembaliDuaKaliCase: CaseData = {
  id: "19-kembali-dua-kali",
  title: "Buku yang Kembali Dua Kali",
  date: "10 November 2026",
  meta: {
    number: "19",
    location: "Ruang Pengembalian",
    level: 5,
    levelLabel: "Sangat sulit",
    summary:
      "Stok buku tidak cocok dengan catatan: beberapa buku tercatat kembali dua kali. Cari pengembalian manual yang tidak didukung pemindaian kartu.",
    skills: ["GROUP BY", "COUNT", "WHERE", "Investigasi"],
  },
  briefing:
    "Hitungan stok bulan ini tidak cocok. Beberapa buku tercatat sudah kembali, padahal masih belum ada di rak. Setiap pengembalian yang sah seharusnya tercatat lewat pemindaian kartu. Telusuri catatan pengembalian untuk menemukan buku yang tercatat dua kali, lalu tentukan siapa yang menambahkan catatan manual untuk buku itu.",

  hints: [
    "Buku yang tercatat dua kali kembali pada tanggal yang sama bisa dicari dengan GROUP BY buku_id, tanggal.",
    "Bandingkan kolom catatan: pemindaian sah ditulis 'scan', entri tambahan ditulis 'manual'.",
  ],

  emails: [
    {
      id: "mail-19-1",
      from: "stok@library.univ.ac.id",
      to: "kepala@library.univ.ac.id",
      subject: "Stok tidak cocok",
      date: "2026-10-23",
      body: "Hitungan Kebun Sunyi dan Surat dari Hulu tidak sama dengan catatan pengembalian. Ada entri yang kelihatannya tidak ada pemindaiannya.",
    },
  ],

  schemaSql: `
    CREATE TABLE petugas (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL
    );

    INSERT INTO petugas VALUES
    (1, 'Rina Kusuma'),
    (2, 'Lia Ananda'),
    (3, 'Doni Firmansyah');

    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL
    );

    INSERT INTO buku VALUES
    (2, 'Peta Tanpa Batas'),
    (4, 'Catatan Malam'),
    (6, 'Surat dari Hulu'),
    (7, 'Kebun Sunyi');

    CREATE TABLE pengembalian (
      id INT PRIMARY KEY,
      buku_id INT NOT NULL,
      petugas_id INT NOT NULL,
      tanggal DATE NOT NULL,
      catatan VARCHAR(20) NOT NULL
    );

    INSERT INTO pengembalian VALUES
    (1, 7, 2, '2026-10-20', 'scan'),
    (2, 7, 3, '2026-10-20', 'manual'),
    (3, 4, 1, '2026-10-21', 'scan'),
    (4, 6, 2, '2026-10-22', 'scan'),
    (5, 2, 2, '2026-10-22', 'scan');
  `,

  report: {
    fields: [
      {
        key: "petugas",
        label: "Siapa yang menambahkan catatan pengembalian manual untuk buku yang sebenarnya belum kembali?",
        hint: "Cari buku yang punya dua catatan di tanggal yang sama, lalu lihat yang berstatus manual.",
        options: [
          { value: "rina", label: "Rina Kusuma" },
          { value: "lia", label: "Lia Ananda" },
          { value: "doni", label: "Doni Firmansyah" },
        ],
      },
    ],
    answer: { petugas: "doni" },
    successMessage:
      "Doni Firmansyah menambahkan catatan manual untuk Kebun Sunyi, padahal buku itu sudah dicatat kembali lewat pemindaian sebelumnya.",
  },
};
