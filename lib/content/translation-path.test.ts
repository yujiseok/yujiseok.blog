import { describe, expect, it } from "vitest";

import {
  listLocaleFiles,
  LOCALE_SUFFIX,
  toTranslationPath,
} from "./translation-path";

describe("toTranslationPath", () => {
  it("원문 경로의 확장자 앞에 .en을 붙인다", () => {
    expect(toTranslationPath("/content/writing/a.mdx")).toBe(
      "/content/writing/a.en.mdx",
    );
  });

  it("끝의 .mdx만 바꾸고 경로 중간은 건드리지 않는다", () => {
    expect(toTranslationPath("/x.mdx/dir/a.mdx")).toBe("/x.mdx/dir/a.en.mdx");
  });
});

describe("LOCALE_SUFFIX", () => {
  it("ko는 접미사가 없고 en은 .en이다", () => {
    expect(LOCALE_SUFFIX).toEqual({ ko: "", en: ".en" });
  });
});

// ko/en 분리 자체는 repository.test.ts의 listLocaleFiles가 이미 검증한다
describe("listLocaleFiles", () => {
  it("toTranslationPath의 결과는 en 목록에서 같은 slug로 돌아온다", () => {
    const translation = toTranslationPath("a.mdx");

    expect(listLocaleFiles([translation], "en")).toEqual([
      { file: translation, slug: "a" },
    ]);
    expect(listLocaleFiles([translation], "ko")).toEqual([]);
  });
});
