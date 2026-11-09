import { describe, expect, it } from "vitest";

import { formatPostDate } from "./date";

describe("formatPostDate", () => {
  it("ko는 한국어 형식으로 포맷한다", () => {
    expect(formatPostDate("2026-03-10", "ko")).toBe("2026년 3월 10일");
  });

  it("en은 영어 형식으로 포맷한다", () => {
    expect(formatPostDate("2026-03-10", "en")).toBe("March 10, 2026");
  });

  it("잘못된 날짜는 원문을 그대로 돌려준다", () => {
    expect(formatPostDate("not-a-date", "ko")).toBe("not-a-date");
    expect(formatPostDate("not-a-date", "en")).toBe("not-a-date");
  });
});
