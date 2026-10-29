export interface GlossaryEntry {
  istilah: string;
  arti: string;
  contoh: string;
}

/** Kata kunci SQL yang dipakai di game, dijelaskan dengan bahasa sederhana */
export const GLOSSARY: GlossaryEntry[] = [
  {
    istilah: "SELECT",
    arti: "Memilih kolom yang ingin ditampilkan.",
    contoh: "SELECT judul, pengarang",
  },
  {
    istilah: "FROM",
    arti: "Menyebut tabel asal data.",
    contoh: "FROM buku",
  },
  {
    istilah: "WHERE",
    arti: "Menyaring baris yang memenuhi syarat.",
    contoh: "WHERE kategori = 'Novel'",
  },
  {
    istilah: "AND / OR",
    arti: "AND berarti kedua syarat harus benar. OR berarti salah satu cukup.",
    contoh: "WHERE kategori = 'Novel' AND tahun_terbit > 2000",
  },
  {
    istilah: "LIKE",
    arti: "Mencocokkan pola teks. % berarti bagian apa pun.",
    contoh: "WHERE judul LIKE '%Dasar%'",
  },
  {
    istilah: "ORDER BY",
    arti: "Mengurutkan hasil. ASC dari kecil, DESC dari besar.",
    contoh: "ORDER BY tahun_terbit DESC",
  },
  {
    istilah: "LIMIT",
    arti: "Membatasi jumlah baris yang ditampilkan.",
    contoh: "LIMIT 3",
  },
  {
    istilah: "COUNT",
    arti: "Menghitung jumlah baris.",
    contoh: "SELECT COUNT(*) FROM buku",
  },
  {
    istilah: "GROUP BY",
    arti: "Mengelompokkan baris yang nilainya sama, lalu setiap kelompok bisa dihitung.",
    contoh: "GROUP BY kategori",
  },
  {
    istilah: "HAVING",
    arti: "Menyaring kelompok setelah GROUP BY. WHERE menyaring baris sebelum dikelompokkan.",
    contoh: "HAVING COUNT(*) > 1",
  },
  {
    istilah: "JOIN",
    arti: "Menggabungkan dua tabel lewat kolom yang saling berhubungan. Hanya baris yang punya pasangan yang muncul.",
    contoh: "JOIN buku b ON b.id = p.buku_id",
  },
  {
    istilah: "LEFT JOIN",
    arti: "Sama seperti JOIN, tetapi semua baris tabel kiri tetap muncul. Yang tidak punya pasangan akan bernilai NULL.",
    contoh: "LEFT JOIN peminjaman p ON p.buku_id = b.id",
  },
  {
    istilah: "NULL",
    arti: "Nilai kosong, bukan angka 0 atau teks kosong.",
    contoh: "WHERE denda IS NULL",
  },
  {
    istilah: "AS",
    arti: "Memberi nama baru pada kolom atau hasil perhitungan di tampilan.",
    contoh: "COUNT(*) AS jumlah",
  },
  {
    istilah: "Alias (a, b)",
    arti: "Nama pendek untuk tabel, supaya kueri lebih ringkas.",
    contoh: "FROM peminjaman p",
  },
];
