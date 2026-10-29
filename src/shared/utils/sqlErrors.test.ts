import { describe, it, expect } from "vitest";
import { explainSqlError } from "@/shared/utils/sqlErrors";

describe("explainSqlError", () => {
  it("menjelaskan tabel yang tidak ditemukan", () => {
    expect(explainSqlError("no such table: buku")).toMatch(/Tabel "buku" tidak ditemukan/);
  });

  it("menjelaskan kolom yang tidak ada", () => {
    expect(explainSqlError("no such column: judull")).toMatch(/Kolom "judull" tidak ada/);
  });

  it("menjelaskan kesalahan penulisan di dekat kata tertentu", () => {
    expect(explainSqlError('near "FORM": syntax error')).toMatch(/dekat "FORM"/);
  });

  it("memakai pesan umum untuk error yang tidak dikenal", () => {
    expect(explainSqlError("sesuatu yang lain")).toMatch(/Periksa lagi penulisannya/);
  });
});
