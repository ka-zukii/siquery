// Daftar seluruh chapter. Urutan ditentukan oleh meta.number.
import type { CaseData } from "../types/case.types";
import type { Chapter } from "../components/main-menu/types";
import { pendaftaranAnggotaCase } from "./01-pendaftaran-anggota/story";
import { kartuAktifCase } from "./02-kartu-aktif/story";
import { missingManuscriptCase } from "./06-missing-manuscript/story";
import { jejakPeminjamanCase } from "./03-jejak-peminjaman/story";

/** Chapter yang sudah bisa dimainkan */
export const CASES: CaseData[] = [
  pendaftaranAnggotaCase,
  kartuAktifCase,
  missingManuscriptCase,
  jejakPeminjamanCase
].sort((a, b) => a.meta.number.localeCompare(b.meta.number));

export const getCaseById = (id: string): CaseData =>
  CASES.find((c) => c.id === id) ?? CASES[0];

/** Chapter yang belum dibuat, hanya tampil sebagai kartu "Segera hadir" */
export const UPCOMING_CHAPTERS: Chapter[] = [
  {
    id: "04-jam-jaga",
    number: "04",
    title: "Jam Jaga",
    subtitle: "Chapter 04: Jam Jaga",
    date: "Segera hadir",
    location: "Pos Satpam",
    level: 3,
    levelLabel: "Menengah",
    description:
      "Cocokkan jam masuk dengan jadwal jaga. Siapa yang masuk saat tidak ada petugas di pos?",
    skills: ["BETWEEN", "SUBQUERY", "EXISTS"],
    isAvailable: false,
  },
  {
    id: "05-denah-tersembunyi",
    number: "05",
    title: "Denah yang Tersembunyi",
    subtitle: "Chapter 05: Denah yang Tersembunyi",
    date: "Segera hadir",
    location: "Ruang Arsip Denah",
    level: 4,
    levelLabel: "Sulit",
    description:
      "Denah lama ternyata dipinjam dengan cara yang tidak biasa. Susun ulang rangkaian peminjamannya.",
    skills: ["WITH", "CASE", "UNION"],
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
