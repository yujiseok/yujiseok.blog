import { describe, expect, it } from "vitest";

import { toTranslationPath } from "./translation-path";

describe("toTranslationPath", () => {
  it.each([
    ["/content/writing/a.mdx", "/content/writing/a.en.mdx"],
    // 끝의 .mdx만 바꾸고 경로 중간은 건드리지 않는다
    ["/x.mdx/dir/a.mdx", "/x.mdx/dir/a.en.mdx"],
  ])("%s → %s", (source, expected) => {
    expect(toTranslationPath(source)).toBe(expected);
  });
});
