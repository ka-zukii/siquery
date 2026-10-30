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
import { rakBerpindahCase } from "./07-rak-berpindah/story";
import { dendaTakDibayarCase } from "./08-denda-tak-dibayar/story";
import { suratTanpaNamaCase } from "./09-surat-tanpa-nama/story";
import { malamTerakhirCase } from "./10-malam-terakhir/story";
import { rakYangSunyiCase } from "./11-rak-yang-sunyi/story";
import { dendaBertingkatCase } from "./12-denda-bertingkat/story";
import { pembacaTeladanCase } from "./13-pembaca-teladan/story";
import { bukuPasanganCase } from "./14-buku-pasangan/story";
import { tigaMejaCase } from "./15-tiga-meja/story";
import { dataBolongCase } from "./16-data-bolong/story";
import { gudangTerlambatCase } from "./17-gudang-terlambat/story";
import { tandaTanganGandaCase } from "./18-tanda-tangan-ganda/story";
import { kembaliDuaKaliCase } from "./19-kembali-dua-kali/story";
import { pemilikSebenarnyaCase } from "./20-pemilik-sebenarnya/story";

/** Chapter yang sudah bisa dimainkan */
export const CASES: CaseData[] = [
  kelasLatihanCase,
  pendaftaranAnggotaCase,
  kartuAktifCase,
  missingManuscriptCase,
  jejakPeminjamanCase,
  jamJagaCase,
  denahTersembunyiCase,
  rakBerpindahCase,
  dendaTakDibayarCase,
  suratTanpaNamaCase,
  malamTerakhirCase,
  rakYangSunyiCase,
  dendaBertingkatCase,
  pembacaTeladanCase,
  bukuPasanganCase,
  tigaMejaCase,
  dataBolongCase,
  gudangTerlambatCase,
  tandaTanganGandaCase,
  kembaliDuaKaliCase,
  pemilikSebenarnyaCase,
].sort((a, b) => a.meta.number.localeCompare(b.meta.number));

export const getCaseById = (id: string): CaseData =>
  CASES.find((c) => c.id === id) ?? CASES[0];

/** Chapter yang belum dibuat, hanya tampil sebagai kartu "Segera hadir". Saat ini kosong. */
export const UPCOMING_CHAPTERS: Chapter[] = [];

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
