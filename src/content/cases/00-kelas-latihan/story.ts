// Chapter 00: Kelas Latihan (tingkat dasar, tanpa cerita)
import type { CaseData } from "@/types/case.types";

export const kelasLatihanCase: CaseData = {
  id: "00-kelas-latihan",
  title: "Kelas Latihan",
  date: "Sebelum bertugas",
  briefing:
    "Sebelum bertugas di perpustakaan, kamu perlu belajar membaca data buku dan peminjaman. Kepala layanan memberi sepuluh tugas kecil. Selesaikan satu per satu, mulai dari yang paling dasar.",

  meta: {
    number: "00",
    location: "Ruang Baca",
    level: 1,
    levelLabel: "Dasar",
    summary:
      "Latihan SQL sebelum bertugas: pilih kolom, saring data, cari teks, urutkan, hitung, dan gabungkan tabel. Cocok untuk pemula.",
    skills: [
      "SELECT",
      "WHERE",
      "AND",
      "LIKE",
      "ORDER BY",
      "LIMIT",
      "COUNT",
      "GROUP BY",
      "HAVING",
      "JOIN",
      "LEFT JOIN",
    ],
  },

  cheatJoin: {
    a: "peminjaman",
    aKey: "buku_id",
    b: "buku",
    bKey: "id",
  },

  hints: [
    "Tulis kueri di Konsol SQL, lalu tekan Periksa jawaban. Hasilmu akan dibandingkan dengan jawaban yang benar.",
  ],

  schemaSql: `
    CREATE TABLE buku (
      id INT PRIMARY KEY,
      judul VARCHAR(100) NOT NULL,
      pengarang VARCHAR(100) NOT NULL,
      tahun_terbit INT NOT NULL,
      kategori VARCHAR(50) NOT NULL
    );

    INSERT INTO buku VALUES
    (1, 'Senja di Pelabuhan', 'Lestari Ayu', 2005, 'Novel'),
    (2, 'Peta Tanpa Batas', 'Hendra Saputra', 1998, 'Sejarah'),
    (3, 'Dasar Basis Data', 'Rina Wijaya', 2019, 'Teknologi'),
    (4, 'Catatan Malam', 'Dewi Anggraini', 2012, 'Novel'),
    (5, 'Arsip Kerajaan', 'Slamet Prasetyo', 1985, 'Sejarah'),
    (6, 'Algoritma Dasar', 'Rina Wijaya', 2021, 'Teknologi'),
    (7, 'Jejak Digital', 'Rina Wijaya', 2023, 'Teknologi');

    CREATE TABLE peminjaman (
      id INT PRIMARY KEY,
      buku_id INT NOT NULL,
      nama_peminjam VARCHAR(100) NOT NULL,
      tanggal_pinjam DATE NOT NULL
    );

    INSERT INTO peminjaman VALUES
    (1, 1, 'Budi', '2026-10-01'),
    (2, 3, 'Sari', '2026-10-03'),
    (3, 3, 'Yoga', '2026-10-10'),
    (4, 6, 'Sari', '2026-10-12'),
    (5, 2, 'Budi', '2026-10-20');
  `,

  lessons: [
    {
      id: "pelajaran-1-select",
      title: "Memilih kolom dengan SELECT",
      explanation:
        "SELECT menentukan kolom mana yang ingin ditampilkan. FROM menentukan tabel asalnya. Tanda bintang (*) berarti semua kolom.",
      exampleSql: "SELECT judul\nFROM buku;",
      prompt: "Tampilkan judul dan pengarang dari semua buku.",
      answerSql: `
        SELECT judul, pengarang FROM buku;
      `,
      hints: [
        "Tulis SELECT, lalu nama kolom yang diminta, dipisahkan koma.",
        "Tambahkan FROM buku di akhir kueri.",
      ],
    },
    {
      id: "pelajaran-2-where",
      title: "Menyaring baris dengan WHERE",
      explanation:
        "WHERE dipakai untuk memilih baris yang memenuhi syarat tertentu. Teks harus diapit tanda kutip tunggal, misalnya 'Novel'.",
      exampleSql: "SELECT judul\nFROM buku\nWHERE kategori = 'Teknologi';",
      prompt: "Tampilkan judul buku dengan kategori Sejarah.",
      answerSql: `
        SELECT judul FROM buku WHERE kategori = 'Sejarah';
      `,
      hints: [
        "Gunakan WHERE untuk menyaring baris berdasarkan kategori.",
        "Teks seperti kategori harus diapit tanda kutip tunggal.",
      ],
    },
    {
      id: "pelajaran-3-and",
      title: "Dua syarat dengan AND",
      explanation:
        "AND dipakai bila baris harus memenuhi dua syarat sekaligus. Angka tidak perlu diberi tanda kutip.",
      exampleSql:
        "SELECT judul\nFROM buku\nWHERE kategori = 'Teknologi'\n  AND tahun_terbit >= 2020;",
      prompt:
        "Tampilkan judul buku kategori Novel yang terbit setelah tahun 2000.",
      answerSql: `
        SELECT judul FROM buku
        WHERE kategori = 'Novel' AND tahun_terbit > 2000;
      `,
      hints: [
        "Gabungkan dua syarat dengan AND di dalam WHERE.",
        "Syaratnya: kategori Novel, dan tahun_terbit lebih besar dari 2000.",
      ],
    },
    {
      id: "pelajaran-4-like",
      title: "Mencari teks dengan LIKE",
      explanation:
        "LIKE mencocokkan pola teks. Tanda % berarti bagian apa pun. 'Jejak%' mencari teks yang diawali Jejak, sedangkan '%kata%' mencari kata di mana saja.",
      exampleSql: "SELECT judul\nFROM buku\nWHERE judul LIKE 'Jejak%';",
      prompt: "Tampilkan judul buku yang mengandung kata 'Dasar'.",
      answerSql: `
        SELECT judul FROM buku WHERE judul LIKE '%Dasar%';
      `,
      hints: [
        "Gunakan WHERE judul LIKE dengan sebuah pola.",
        "Tanda % di depan dan di belakang membuat kata boleh berada di mana saja.",
      ],
    },
    {
      id: "pelajaran-5-order-by",
      title: "Mengurutkan hasil dengan ORDER BY",
      explanation:
        "ORDER BY mengurutkan baris hasil. ASC berarti dari kecil ke besar atau A ke Z, DESC berarti dari besar ke kecil. Tanpa ORDER BY, urutan baris tidak dijamin.",
      exampleSql: "SELECT judul\nFROM buku\nORDER BY judul ASC;",
      prompt:
        "Tampilkan judul dan tahun terbit semua buku, urutkan dari yang terbit paling baru.",
      answerSql: `
        SELECT judul, tahun_terbit FROM buku ORDER BY tahun_terbit DESC;
      `,
      ordered: true,
      hints: [
        "Tambahkan ORDER BY di akhir kueri, dengan kolom tahun_terbit.",
        "Yang terbaru berarti nilai terbesar, jadi gunakan DESC.",
      ],
    },
    {
      id: "pelajaran-6-limit",
      title: "Membatasi baris dengan LIMIT",
      explanation:
        "LIMIT membatasi berapa baris yang ditampilkan. Biasanya dipakai bersama ORDER BY, misalnya untuk mengambil lima data teratas.",
      exampleSql: "SELECT judul\nFROM buku\nORDER BY judul ASC\nLIMIT 2;",
      prompt:
        "Tampilkan judul dan tahun terbit 3 buku yang terbit paling baru.",
      answerSql: `
        SELECT judul, tahun_terbit FROM buku ORDER BY tahun_terbit DESC LIMIT 3;
      `,
      ordered: true,
      hints: [
        "Urutkan dulu dengan ORDER BY, lalu tambahkan LIMIT di belakangnya.",
        "Gunakan DESC agar yang terbaru ada di atas, dan LIMIT 3 untuk tiga baris pertama.",
      ],
    },
    {
      id: "pelajaran-7-group-by",
      title: "Menghitung dengan COUNT dan GROUP BY",
      explanation:
        "COUNT(*) menghitung jumlah baris. GROUP BY membagi baris ke dalam kelompok, lalu COUNT dihitung untuk setiap kelompok. Biasanya kolom pengelompokan juga ditampilkan di SELECT agar hasilnya mudah dibaca.",
      exampleSql:
        "SELECT pengarang, COUNT(*) AS jumlah\nFROM buku\nGROUP BY pengarang;",
      prompt: "Hitung jumlah buku di setiap kategori.",
      answerSql: `
        SELECT kategori, COUNT(*) AS jumlah
        FROM buku
        GROUP BY kategori;
      `,
      hints: [
        "Gunakan COUNT(*) dan kelompokkan dengan GROUP BY.",
        "Kolom yang dikelompokkan, yaitu kategori, juga ditulis di SELECT.",
      ],
    },
    {
      id: "pelajaran-8-having",
      title: "Menyaring kelompok dengan HAVING",
      explanation:
        "HAVING menyaring hasil setelah GROUP BY. WHERE menyaring baris sebelum dikelompokkan, sedangkan HAVING menyaring kelompok sesudahnya.",
      exampleSql:
        "SELECT kategori, COUNT(*) AS jumlah\nFROM buku\nGROUP BY kategori\nHAVING COUNT(*) = 2;",
      prompt:
        "Tampilkan pengarang yang memiliki lebih dari satu buku, beserta jumlah bukunya.",
      answerSql: `
        SELECT pengarang, COUNT(*) AS jumlah
        FROM buku
        GROUP BY pengarang
        HAVING COUNT(*) > 1;
      `,
      hints: [
        "Kelompokkan berdasarkan pengarang, lalu hitung dengan COUNT(*).",
        "Setelah GROUP BY, gunakan HAVING COUNT(*) > 1 untuk memilih kelompok.",
      ],
    },
    {
      id: "pelajaran-9-join",
      title: "Menggabungkan tabel dengan JOIN",
      explanation:
        "JOIN menggabungkan dua tabel berdasarkan kolom yang saling berhubungan. Di sini, buku_id di peminjaman menunjuk ke id di buku. Alias (misalnya b dan p) membuat kueri lebih pendek.",
      exampleSql:
        "SELECT p.nama_peminjam, b.judul\nFROM peminjaman p\nJOIN buku b ON b.id = p.buku_id\nWHERE b.kategori = 'Novel';",
      prompt:
        "Tampilkan nama peminjam dan judul buku yang mereka pinjam.",
      answerSql: `
        SELECT p.nama_peminjam, b.judul
        FROM peminjaman p
        JOIN buku b ON b.id = p.buku_id;
      `,
      hints: [
        "Hubungkan buku_id di peminjaman dengan id di buku.",
        "Tulis FROM peminjaman p JOIN buku b ON b.id = p.buku_id.",
      ],
    },
    {
      id: "pelajaran-10-left-join",
      title: "Tetap tampilkan data tanpa pasangan dengan LEFT JOIN",
      explanation:
        "JOIN hanya menampilkan baris yang punya pasangan di kedua tabel. LEFT JOIN tetap menampilkan semua baris di tabel kiri. Bila tidak ada pasangan, kolom dari tabel kanan bernilai NULL.",
      exampleSql:
        "SELECT p.nama_peminjam, b.judul\nFROM peminjaman p\nLEFT JOIN buku b ON b.id = p.buku_id;",
      prompt:
        "Tampilkan judul setiap buku beserta nama peminjamnya. Buku yang belum pernah dipinjam tetap harus muncul.",
      answerSql: `
        SELECT b.judul, p.nama_peminjam
        FROM buku b
        LEFT JOIN peminjaman p ON p.buku_id = b.id;
      `,
      hints: [
        "Mulai dari tabel buku, lalu gabungkan dengan peminjaman memakai LEFT JOIN.",
        "Buku yang belum dipinjam akan muncul dengan nama peminjam NULL.",
      ],
    },
  ],
};
