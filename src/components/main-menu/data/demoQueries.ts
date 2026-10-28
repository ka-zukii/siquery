export interface DemoQuery {
  ticket: string;
  sql: string;
  cols: string[];
  rows: string[][];
}

export const DEMO_QUERIES: DemoQuery[] = [
  {
    ticket: "Tiket #0417 — cari buku dari nama penulis dan tahun terbit",
    sql: "SELECT judul, tahun_terbit\nFROM buku\nWHERE penulis LIKE 'Raden%'\n  AND tahun_terbit = 1998;",
    cols: ["judul", "tahun_terbit"],
    rows: [["Laskar Aksara", "1998"]],
  },
  {
    ticket: "Tiket #0418 — hitung denda keterlambatan",
    sql: "SELECT a.nama, COUNT(p.id) AS telat\nFROM peminjaman p\nJOIN anggota a ON a.id = p.id_anggota\nWHERE p.tgl_kembali > p.jatuh_tempo\nGROUP BY a.nama;",
    cols: ["nama", "telat"],
    rows: [
      ["Dewi Lestari", "3"],
      ["Bagas Pratama", "1"],
    ],
  },
  {
    ticket: "Tiket #0419 — daftarkan mahasiswa baru",
    sql: "INSERT INTO anggota (nim, nama)\nVALUES ('2610045', 'Salsa Nirmala');",
    cols: ["status"],
    rows: [["1 anggota baru tercatat"]],
  },
];

export const SQL_KEYWORDS =
  /(\bSELECT\b|\bFROM\b|\bWHERE\b|\bAND\b|\bJOIN\b|\bON\b|\bGROUP BY\b|\bCOUNT\b|\bINSERT INTO\b|\bVALUES\b|\bAS\b|\bLIKE\b)/;

