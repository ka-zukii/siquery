import { describe, it, expect } from "vitest";
import {
  caseProgress,
  clearCaseProgress,
  isCaseSolved,
  markCaseSolved,
  readCompletedLessons,
  writeCompletedLessons,
} from "@/content/progress";
import type { CaseData, Lesson } from "@/types/case.types";

// Penyimpanan palsu untuk lingkungan tanpa browser
const store = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  },
};

const lessons = [{ id: "a" }, { id: "b" }, { id: "c" }] as Lesson[];
const fakeCase = (id: string) =>
  ({ id, lessons, meta: {}, title: "", date: "", briefing: "", schemaSql: "", hints: [] }) as unknown as CaseData;

describe("progres pelajaran", () => {
  it("membaca format lama berupa nomor urut dan mengubahnya menjadi ID", () => {
    store.set("siquery.lessons.lama", "2");
    expect(readCompletedLessons("lama", lessons)).toEqual(["a", "b"]);
  });

  it("menyimpan dan membaca daftar ID", () => {
    writeCompletedLessons("baru", ["c", "a"]);
    expect(readCompletedLessons("baru", lessons)).toEqual(["c", "a"]);
  });

  it("menghitung pelajaran selesai dari ID, bukan urutan", () => {
    writeCompletedLessons("hitung", ["c"]);
    expect(caseProgress(fakeCase("hitung")).label).toBe("1 dari 3 pelajaran");
  });
});

describe("status kasus", () => {
  it("menandai kasus selesai lalu menghapusnya saat main ulang", () => {
    markCaseSolved("kasus");
    writeCompletedLessons("kasus", ["a"]);
    expect(isCaseSolved("kasus")).toBeTruthy();
    expect(caseProgress(fakeCase("kasus")).done).toBeTruthy();

    clearCaseProgress("kasus");
    expect(isCaseSolved("kasus")).toBeFalsy();
    expect(caseProgress(fakeCase("kasus")).label).toBe("0 dari 3 pelajaran");
  });
});
