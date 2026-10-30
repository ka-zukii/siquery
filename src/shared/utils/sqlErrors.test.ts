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

describe("explainSqlError dengan saran nama", () => {
  const schema = [
    { name: "anggota", cols: ["id", "nama_anggota", "fakultas"] },
    { name: "buku", cols: ["judul", "penulis"] },
  ];

  it("menyarankan kolom yang namanya memuat kata yang salah", () => {
    expect(explainSqlError("no such column: nama", schema)).toMatch(/nama_anggota/);
  });

  it("menyarankan kolom dengan salah eja kecil", () => {
    expect(explainSqlError("no such column: judull", schema)).toMatch(/"judul"/);
  });

  it("menyarankan tabel yang mirip", () => {
    expect(explainSqlError("no such table: anggot", schema)).toMatch(/"anggota"/);
  });

  it("tidak menyarankan apa pun bila tidak ada yang mirip", () => {
    expect(explainSqlError("no such column: xyzzy", schema)).not.toMatch(/Mungkin/);
  });

  it("menjelaskan pelanggaran UNIQUE dan NOT NULL", () => {
    expect(explainSqlError("UNIQUE constraint failed: anggota.id")).toMatch(/harus unik/);
    expect(explainSqlError("NOT NULL constraint failed: buku.judul")).toMatch(/tidak boleh kosong/);
  });
});
