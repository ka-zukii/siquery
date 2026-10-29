// Daftar seluruh chapter. Urutan ditentukan oleh meta.number.
import type { CaseData } from "@/types/case.types";
import type { Chapter } from "@/features/menu/types";
import { kelasLatihanCase } from "./00-kelas-latihan/story";
import { pendaftaranAnggotaCase } from "./01-pendaftaran-anggota/story";
import { kartuAktifCase } from "./02-kartu-aktif/story";
import { missingManuscriptCase } from "./06-missing-manuscript/story";
import { jejakPeminjamanCase } from "./03-jejak-peminjaman/story";
import { jamJagaCase } from "./04-jam-jaga/story";
import { denahTersembunyiCase } from "./05-denah-tersembunyi/story";

/** Chapter yang sudah bisa dimainkan */
export const CASES: CaseData[] = [
  kelasLatihanCase,
  pendaftaranAnggotaCase,
  kartuAktifCase,
  missingManuscriptCase,
  jejakPeminjamanCase,
  jamJagaCase,
  denahTersembunyiCase,
].sort((a, b) => a.meta.number.localeCompare(b.meta.number));

export const getCaseById = (id: string): CaseData =>
  CASES.find((c) => c.id === id) ?? CASES[0];

/** Chapter yang belum dibuat, hanya tampil sebagai kartu "Segera hadir" */
export const UPCOMING_CHAPTERS: Chapter[] = [
  {
    id: "07-rak-berpindah",
    number: "07",
    title: "Rak yang Berpindah",
    subtitle: "Chapter 07: Rak yang Berpindah",
    date: "Segera hadir",
    location: "Katalog Rak",
    level: 3,
    levelLabel: "Menengah",
    description:
      "Buku terus berpindah rak tanpa ada yang mencatatnya di kartu katalog. Temukan buku yang paling sering dipindah.",
    skills: ["GROUP BY", "HAVING", "COUNT"],
    isAvailable: false,
  },
  {
    id: "08-denda-tak-dibayar",
    number: "08",
    title: "Denda yang Tak Pernah Dibayar",
    subtitle: "Chapter 08: Denda yang Tak Pernah Dibayar",
    date: "Segera hadir",
    location: "Meja Pengembalian",
    level: 3,
    levelLabel: "Menengah",
    description:
      "Bendahara menemukan selisih denda. Tampilkan total denda yang belum dibayar untuk setiap anggota, termasuk yang tidak punya denda.",
    skills: ["LEFT JOIN", "SUM", "COALESCE"],
    isAvailable: false,
  },
  {
    id: "09-surat-tanpa-nama",
    number: "09",
    title: "Surat Tanpa Nama",
    subtitle: "Chapter 09: Surat Tanpa Nama",
    date: "Segera hadir",
    location: "Kotak Masuk Kepala",
    level: 4,
    levelLabel: "Sulit",
    description:
      "Kunci cadangan ruang koleksi terkirim ke alamat luar kampus. Telusuri jalur emailnya dari awal.",
    skills: ["LIKE", "ORDER BY"],
    isAvailable: false,
  },
  {
    id: "10-malam-terakhir",
    number: "10",
    title: "Malam Terakhir",
    subtitle: "Chapter 10: Malam Terakhir",
    date: "Segera hadir",
    location: "Ruang Koleksi Khusus",
    level: 5,
    levelLabel: "Sangat sulit",
    description:
      "Kunci sudah bocor dan ruang koleksi dibuka sebentar malam itu. Susun semua petunjuk untuk menemukan dalangnya.",
    skills: ["JOIN", "SUBQUERY", "GROUP BY"],
    isAvailable: false,
  },
];

/** Ubah data kasus menjadi bentuk kartu di menu */
export const caseToChapter = (c: CaseData): Chapter => ({
  id: c.id,
  number: c.meta.number,
  title: c.title,
  subtitle: `Chapter ${c.meta.number}: ${c.title}`,
  date: c.date,
  location: c.meta.location,
  level: c.meta.level,
  levelLabel: c.meta.levelLabel,
  description: c.meta.summary,
  skills: c.meta.skills,
  isAvailable: true,
});
