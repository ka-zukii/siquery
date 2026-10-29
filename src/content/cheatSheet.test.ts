import { describe, it, expect } from "vitest";
import { buildCheatSheet } from "@/content/cheatSheet";
import { kelasLatihanCase } from "@/content/cases/00-kelas-latihan/story";
import { malamTerakhirCase } from "@/content/cases/10-malam-terakhir/story";

describe("contekan JOIN", () => {
  it("memakai kunci gabung yang ditulis di chapter latihan", () => {
    const join = buildCheatSheet(kelasLatihanCase).entries.find((e) => e.skill === "JOIN");
    expect(join?.kode).toMatch(/JOIN buku b ON b\.id = a\.buku_id/);
  });

  it("tidak membandingkan id dengan id di chapter latihan", () => {
    const all = buildCheatSheet(kelasLatihanCase).entries.map((e) => e.kode).join("\n");
    expect(all).not.toMatch(/b\.id = a\.id/);
  });

  it("subkueri memakai kondisi kustom bila ada", () => {
    const all = buildCheatSheet(malamTerakhirCase).entries.map((e) => e.kode).join("\n");
    expect(all).not.toMatch(/dari IN/);
  });
});
