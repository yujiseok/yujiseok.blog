import { describe, expect, it } from "vitest";

import { formatPostDate } from "./date";

describe("formatPostDate", () => {
  it("formats a valid date in ko-KR", () => {
    expect(formatPostDate("2026-03-10")).toBe("2026년 3월 10일");
  });

  it("returns the original string for an invalid date", () => {
    expect(formatPostDate("not-a-date")).toBe("not-a-date");
  });
});
