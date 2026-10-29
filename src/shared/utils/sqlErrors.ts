interface Rule {
  test: RegExp;
  explain: (m: RegExpMatchArray) => string;
}

/** Pesan error dari SQLite, diubah menjadi penjelasan dan saran perbaikan */
const RULES: Rule[] = [
  {
    test: /no such table: ([\w.]+)/i,
    explain: (m) =>
      `Tabel "${m[1]}" tidak ditemukan. Periksa ejaan namanya di daftar Skema database.`,
  },
  {
    test: /no such column: ([\w.]+)/i,
    explain: (m) =>
      `Kolom "${m[1]}" tidak ada di tabel yang dipakai. Periksa ejaannya, dan pastikan tabelnya sudah disebut di FROM atau JOIN.`,
  },
  {
    test: /ambiguous column name: ([\w.]+)/i,
    explain: (m) =>
      `Kolom "${m[1]}" ada di lebih dari satu tabel. Tulis nama tabel di depannya, misalnya tabel.kolom.`,
  },
  {
    test: /near "([^"]*)": syntax error/i,
    explain: (m) =>
      `Penulisan di dekat "${m[1]}" belum benar. Biasanya ada kata kunci yang salah eja, tanda koma yang kurang atau berlebih, atau tanda baca yang hilang.`,
  },
  {
    test: /incomplete input/i,
    explain: () =>
      "Kueri belum selesai. Periksa apakah ada tanda kutip atau kurung yang belum ditutup, atau bagian kueri yang terpotong.",
  },
  {
    test: /unrecognized token/i,
    explain: () =>
      "Ada simbol atau tanda kutip yang tidak dikenali. Untuk teks gunakan tanda kutip tunggal, misalnya 'Novel'.",
  },
  {
    test: /misuse of aggregate/i,
    explain: () =>
      "Fungsi seperti COUNT atau SUM dipakai di tempat yang tidak sesuai. Coba tambahkan GROUP BY, atau pindahkan syarat kelompok ke HAVING.",
  },
  {
    test: /no such function: (\w+)/i,
    explain: (m) => `Fungsi "${m[1]}" tidak dikenal. Periksa ejaannya.`,
  },
];

export const explainSqlError = (message: string): string => {
  for (const rule of RULES) {
    const m = message.match(rule.test);
    if (m) return rule.explain(m);
  }
  return "Kueri belum bisa dijalankan. Periksa lagi penulisannya.";
};
