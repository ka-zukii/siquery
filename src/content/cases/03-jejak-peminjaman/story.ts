// Chapter 3: Jejak Peminjaman (tingkat menengah)
import type { CaseData } from "@/types/case.types";

export const jejakPeminjamanCase: CaseData = {
  id: "03-jejak-peminjaman",
  title: "Jejak Peminjaman",
  date: "27 Oktober 2026",
  meta: {
    number: "03",
    location: "Meja Sirkulasi",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Beberapa buku belum kembali ke rak. Gabungkan data peminjaman dengan data anggota untuk mengetahui siapa yang masih memegangnya.",
    skills: ["JOIN", "LEFT JOIN", "IS NULL"],
  },
  briefing:
    "Rak sirkulasi kehilangan jejak beberapa buku. Tampilkan semua peminjaman yang belum dikembalikan, beserta nama peminjam dan judul bukunya, diurutkan dari tanggal pinjam paling lama. Peminjam yang sudah tidak terdaftar di data anggota tetap harus ikut ditampilkan.",

  hints: [
    "Peminjaman yang belum dikembalikan punya return_date kosong. Cari dengan WHERE return_date IS NULL.",
    "Tidak semua peminjam masih terdaftar di tabel members. Gunakan LEFT JOIN supaya peminjaman dari anggota yang sudah dihapus tetap muncul.",
  ],

  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_BukuSirkulasi",
      title: "Catatan Meja Sirkulasi",
      category: "document",
      dateOrTag: "26 Okt 2026",
      content:
        "Kartu peminjam nomor 999 masih tercatat meminjam Kamus Bahasa Melayu Kuno, tetapi data anggota dengan nomor itu sudah tidak ada di sistem.",
    },
  ],

  schemaSql: `
    CREATE TABLE members (
        member_id INT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        department VARCHAR(50) NOT NULL
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

    INSERT INTO members VALUES
    (201, 'Lestari Ayu',      'Mahasiswa', 'Sejarah'),
    (202, 'Yoga Prasetyo',    'Mahasiswa', 'Sastra Kuno'),
    (203, 'Hana Wirawan',     'Mahasiswa', 'Filologi'),
    (204, 'Darmawan Siregar', 'Staf',      'Sirkulasi'),
    (205, 'Kirana Dewi',      'Dosen',     'Arkeologi');

    INSERT INTO books VALUES
    ('BK-101', 'Serat Centhini Salinan',      'Sastra Jawa', 'Rak Koleksi B2'),
    ('BK-102', 'Hikayat Raja-Raja Pasai',     'Sejarah',     'Rak Umum A3'),
    ('BK-103', 'Babad Tanah Jawi',            'Sejarah',     'Rak Umum A4'),
    ('BK-104', 'Kamus Bahasa Melayu Kuno',    'Bahasa',      'Rak Referensi B1'),
    ('BK-105', 'Atlas Pelayaran Nusantara',   'Geografi',    'Rak Umum C1');

    INSERT INTO borrowing_records VALUES
    (1, 201, 'BK-103', '2026-09-03', '2026-09-17'),
    (2, 202, 'BK-102', '2026-09-10', '2026-09-24'),
    (3, 203, 'BK-101', '2026-10-02', NULL),
    (4, 204, 'BK-103', '2026-10-05', '2026-10-12'),
    (5, 205, 'BK-105', '2026-10-08', NULL),
    (6, 202, 'BK-104', '2026-10-18', '2026-10-25'),
    (7, 201, 'BK-102', '2026-10-21', NULL),
    (8, 999, 'BK-104', '2026-10-20', NULL);
  `,

  // Kunci validasi: 4 baris, termasuk peminjaman dari anggota 999 yang tidak ada di members
  answerSql: `
    SELECT m.full_name, b.title, r.borrow_date
    FROM borrowing_records r
    JOIN books b ON b.book_id = r.book_id
    LEFT JOIN members m ON m.member_id = r.member_id
    WHERE r.return_date IS NULL
    ORDER BY r.borrow_date;
  `,
};
