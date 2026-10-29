import { describe, it, expect } from "vitest";
import initSqlJs from "sql.js";
import { CASES } from "@/content/cases";
import { kelasLatihanCase } from "@/content/cases/00-kelas-latihan/story";

describe("daftar kasus", () => {
  it("setiap kasus punya ID dan nomor yang unik", () => {
    const ids = CASES.map((c) => c.id);
    const numbers = CASES.map((c) => c.meta.number);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("setiap pelajaran punya ID dan kueri target yang unik", () => {
    const lessons = kelasLatihanCase.lessons ?? [];
    expect(lessons.length).toBe(10);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    lessons.forEach((l) => expect(l.hints?.length).toBe(2));
  });
});

describe("jawaban pelajaran", () => {
  it("setiap jawaban pelajaran bisa dijalankan pada skema chapter", async () => {
    const SQL = await initSqlJs();
    const lessons = kelasLatihanCase.lessons ?? [];
    for (const lesson of lessons) {
      const db = new SQL.Database();
      db.run(kelasLatihanCase.schemaSql);
      const rows = db.exec(lesson.answerSql);
      expect(rows.length).toBe(1);
      db.close();
    }
  });
});
