import { describe, expect, it } from "vitest";

import { readAllContent } from "./utils";

/*
 * "use cache"는 vitest 환경에서 동작하지 않으므로 캐시 래퍼(getAllContent)가
 * 아니라 그 안에서 실제 파일을 읽고 정렬하는 순수 함수를 검증한다.
 */
describe("readAllContent", () => {
  it("writing의 slug와 metadata를 파일에서 읽어 낸다", async () => {
    const writings = await readAllContent("writing");
    const spotify = writings.find((writing) => writing.slug === "spotify");

    expect(spotify?.metadata.title).toBe(
      "Next.js 블로그에 스포티파이를 더 해보자",
    );
    expect(spotify?.metadata.publishedAt).toBe("2025-03-15");
  });

  it("publishedAt 기준 내림차순으로 정렬한다", async () => {
    const writings = await readAllContent("writing");
    const publishedAtTimes = writings.map((writing) =>
      new Date(writing.metadata.publishedAt).getTime(),
    );

    expect(publishedAtTimes).toEqual(
      [...publishedAtTimes].sort((a, b) => b - a),
    );
  });
});
