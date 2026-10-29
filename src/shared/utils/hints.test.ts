import { describe, it, expect } from "vitest";
import { revealedHintCount } from "@/shared/utils/hints";

describe("revealedHintCount", () => {
  it("membuka satu petunjuk di awal", () => {
    expect(revealedHintCount(0, 3)).toBe(1);
  });

  it("membuka petunjuk berikutnya setiap dua kali salah", () => {
    expect(revealedHintCount(1, 3)).toBe(1);
    expect(revealedHintCount(2, 3)).toBe(2);
    expect(revealedHintCount(4, 3)).toBe(3);
  });

  it("tidak melebihi jumlah petunjuk", () => {
    expect(revealedHintCount(10, 3)).toBe(3);
  });

  it("nol bila tidak ada petunjuk", () => {
    expect(revealedHintCount(5, 0)).toBe(0);
  });
});
