import { describe, it, expect } from "vitest";
import {
  buildFeedback,
  isSameOrderedResult,
  isSameResult,
} from "@/shared/utils/checkAnswer";
import type { QueryResult } from "@/types/case.types";

const res = (values: (string | number | null)[][]): QueryResult => ({
  columns: [],
  values,
});

describe("isSameResult", () => {
  it("menerima baris dengan urutan berbeda", () => {
    expect(
      isSameResult(res([[2, "b"], [1, "a"]]), res([[1, "a"], [2, "b"]])),
    ).toBeTruthy();
  });

  it("menolak jumlah baris yang berbeda", () => {
    expect(isSameResult(res([[1, "a"]]), res([[1, "a"], [2, "b"]]))).toBeFalsy();
  });

  it("menerima kolom tambahan", () => {
    expect(isSameResult(res([[1, "a", "x"]]), res([[1, "a"]]))).toBeTruthy();
  });

  it("menganggap NULL cocok dengan NULL", () => {
    expect(isSameResult(res([["a", null]]), res([["a", null]]))).toBeTruthy();
  });
});

describe("isSameOrderedResult", () => {
  it("menolak urutan yang salah", () => {
    expect(
      isSameOrderedResult(res([[2, "b"], [1, "a"]]), res([[1, "a"], [2, "b"]])),
    ).toBeFalsy();
  });

  it("menerima urutan yang benar", () => {
    expect(
      isSameOrderedResult(res([[1, "a"], [2, "b"]]), res([[1, "a"], [2, "b"]])),
    ).toBeTruthy();
  });
});

describe("buildFeedback", () => {
  it("melaporkan hasil kosong", () => {
    expect(buildFeedback(res([]), res([[1]])).kind).toBe("empty");
  });

  it("melaporkan kecocokan sebagian", () => {
    expect(buildFeedback(res([[1]]), res([[1], [2]])).kind).toBe("partial");
  });
});
