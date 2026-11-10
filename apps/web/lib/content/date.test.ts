import { describe, expect, it } from "vitest";

import { formatPostDate } from "./date";

describe("formatPostDate", () => {
  it.each([
    ["ko", "2026년 3월 10일"],
    ["en", "March 10, 2026"],
  ] as const)("%s는 해당 언어 형식으로 포맷한다", (locale, expected) => {
    expect(formatPostDate("2026-03-10", locale)).toBe(expected);
  });

  it("잘못된 날짜는 원문을 그대로 돌려준다", () => {
    expect(formatPostDate("not-a-date", "ko")).toBe("not-a-date");
    expect(formatPostDate("not-a-date", "en")).toBe("not-a-date");
  });
});
