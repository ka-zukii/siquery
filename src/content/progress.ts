import type { CaseData, Lesson } from "@/types/case.types";

const SOLVED_PREFIX = "siquery.solved.";
const LESSON_PREFIX = "siquery.lessons.";

const readItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Tidak apa-apa bila tidak bisa disimpan; progres hanya hilang di sesi ini
  }
};

export const isCaseSolved = (caseId: string): boolean =>
  readItem(SOLVED_PREFIX + caseId) === "1";

export const markCaseSolved = (caseId: string) =>
  writeItem(SOLVED_PREFIX + caseId, "1");

/**
 * ID pelajaran yang sudah selesai. Versi lama menyimpan nomor urut pelajaran;
 * nomor itu diubah menjadi ID dari daftar pelajaran yang sekarang.
 */
export const readCompletedLessons = (
  caseId: string,
  lessons: Lesson[],
): string[] => {
  const raw = readItem(LESSON_PREFIX + caseId);
  if (raw === null) return [];

  if (/^\d+$/.test(raw)) {
    return lessons.slice(0, Number(raw)).map((l) => l.id);
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
};

export const writeCompletedLessons = (caseId: string, ids: string[]) =>
  writeItem(LESSON_PREFIX + caseId, JSON.stringify(ids));

/** Menghapus status selesai dan progres pelajaran, supaya kasus bisa dimainkan ulang */
export const clearCaseProgress = (caseId: string) => {
  try {
    window.localStorage.removeItem(SOLVED_PREFIX + caseId);
    window.localStorage.removeItem(LESSON_PREFIX + caseId);
  } catch {
    // Tidak apa-apa; progres akan tetap tersimpan
  }
};

export interface CaseProgress {
  done: boolean;
  label: string;
}

export const caseProgress = (c: CaseData): CaseProgress => {
  if (isCaseSolved(c.id)) return { done: true, label: "Selesai" };
  if (c.lessons && c.lessons.length > 0) {
    const completed = readCompletedLessons(c.id, c.lessons);
    const count = c.lessons.filter((l) => completed.includes(l.id)).length;
    return { done: false, label: `${count} dari ${c.lessons.length} pelajaran` };
  }
  return { done: false, label: "Belum selesai" };
};
