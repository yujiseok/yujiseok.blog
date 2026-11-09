import { describe, expect, it } from "vitest";

import { PAGE_WIDTH, pageWidth } from "./page-spacing";

describe("pageWidth", () => {
  it.each(["/ko", "/en"])("%s는 홈 폭이다", (pathname) => {
    expect(pageWidth(pathname)).toBe(PAGE_WIDTH.home);
  });

  it.each(["/ko/resume", "/en/resume"])("%s는 이력서 폭이다", (pathname) => {
    expect(pageWidth(pathname)).toBe(PAGE_WIDTH.resume);
  });

  it.each([
    "/ko/posts",
    "/en/posts/a",
    "/ko/music/top-tracks",
    "/ko/없는-주소",
  ])("%s는 기본 폭이다", (pathname) => {
    expect(pageWidth(pathname)).toBe(PAGE_WIDTH.default);
  });
});
