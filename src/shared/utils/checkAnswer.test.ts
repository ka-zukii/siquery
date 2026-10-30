import { describe, it, expect } from "vitest";
import {
  buildFeedback,
  describeFeedback,
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

describe("describeFeedback", () => {
  it("menyebut jumlah baris pemain dan target", () => {
    const f = buildFeedback(res([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12]]), res([[1], [2], [3], [4], [5]]));
    expect(describeFeedback(f)).toMatch(/punya 12 baris, target punya 5/);
  });

  it("menandai kondisi terlalu longgar bila baris pemain lebih banyak", () => {
    const f = buildFeedback(res([[1], [2], [3]]), res([[1], [2]]));
    expect(describeFeedback(f)).toMatch(/terlalu longgar/);
  });

  it("menandai kondisi terlalu ketat bila baris pemain lebih sedikit", () => {
    const f = buildFeedback(res([[1]]), res([[1], [2], [3]]));
    expect(describeFeedback(f)).toMatch(/terlalu ketat/);
  });
});
