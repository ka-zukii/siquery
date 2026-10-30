// Chapter 14: Buku Pasangan (tingkat sulit, self-join)
import type { CaseData } from "@/types/case.types";

export const bukuPasanganCase: CaseData = {
  id: "14-buku-pasangan",
  title: "Buku Pasangan",
  date: "5 November 2026",
  meta: {
    number: "14",
    location: "Ruang Katalog Induk",
    level: 4,
    levelLabel: "Sulit",
    summary:
      "Katalog induk perlu memisahkan buku dari pengarang yang sama. Gabungkan tabel buku dengan dirinya sendiri untuk mencari pasangan.",
    skills: ["Self JOIN", "Alias tabel", "Kondisi a.id < b.id"],
  },
  briefing:
    "Katalog induk ingin menandai buku yang ditulis pengarang yang sama, supaya bisa dikelompokkan dalam rak yang berdekatan. Tampilkan pasangan judul buku yang pengarangnya sama, beserta nama pengarangnya. Setiap pasangan hanya muncul sekali, dan diurutkan berdasarkan id buku pertama lalu id buku kedua.",

  hints: [
    "Gabungkan tabel buku dengan dirinya sendiri, beri alias a dan b.",
    "Syarat a.pengarang = b.pengarang saja akan memunculkan pasangan dua kali dan juga buku dengan dirinya sendiri. Tambahkan a.id < b.id.",
  ],

  schemaSql: `
    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL,
      pengarang VARCHAR(100) NOT NULL,
      kategori VARCHAR(50) NOT NULL
    );

    INSERT INTO buku VALUES
    (1, 'Senja di Pelabuhan', 'Lestari Ayu', 'Novel'),
    (2, 'Catatan Malam', 'Dewi Anggraini', 'Novel'),
    (3, 'Dasar Basis Data', 'Rina Wijaya', 'Teknologi'),
    (4, 'Algoritma Dasar', 'Rina Wijaya', 'Teknologi'),
    (5, 'Jejak Digital', 'Rina Wijaya', 'Teknologi'),
    (6, 'Arsip Kerajaan', 'Slamet Prasetyo', 'Sejarah'),
    (7, 'Kebun Sunyi', 'Lestari Ayu', 'Novel');
  `,

  answerSql: `
    SELECT a.judul AS judul_pertama, b.judul AS judul_kedua, a.pengarang
    FROM buku a
    JOIN buku b ON a.pengarang = b.pengarang AND a.id < b.id
    ORDER BY a.id, b.id;
  `,
};
