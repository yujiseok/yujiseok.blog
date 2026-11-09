import { describe, expect, it } from "vitest";

import { routeLocale } from "./route-locale";

describe("routeLocale", () => {
  it("접두사가 없으면 고른 언어로 307 대상 주소를 낸다", () => {
    expect(
      routeLocale({ pathname: "/posts/x", acceptLanguage: "en-US" }),
    ).toEqual({ type: "redirect", location: "/en/posts/x" });
    expect(
      routeLocale({ pathname: "/posts/x", acceptLanguage: "ko-KR,ko;q=0.9" }),
    ).toEqual({ type: "redirect", location: "/ko/posts/x" });
  });

  it("루트는 /{locale}로 간다", () => {
    expect(routeLocale({ pathname: "/", acceptLanguage: "ja" })).toEqual({
      type: "redirect",
      location: "/en",
    });
  });

  it("헤더가 없으면 ko", () => {
    expect(routeLocale({ pathname: "/" })).toEqual({
      type: "redirect",
      location: "/ko",
    });
  });

  it("쿠키가 Accept-Language보다 우선한다", () => {
    expect(
      routeLocale({ pathname: "/", cookie: "ko", acceptLanguage: "en" }),
    ).toEqual({ type: "redirect", location: "/ko" });
  });

  it("쿼리 문자열을 보존한다", () => {
    expect(
      routeLocale({ pathname: "/gallery", search: "?artist=a&image=b" }),
    ).toEqual({ type: "redirect", location: "/ko/gallery?artist=a&image=b" });
  });

  it("접두사가 있으면 쿠키와 달라도 그대로 통과시킨다", () => {
    expect(routeLocale({ pathname: "/en/posts", cookie: "ko" })).toEqual({
      type: "pass",
    });
    expect(routeLocale({ pathname: "/ko" })).toEqual({ type: "pass" });
  });

  it("언어와 비슷하게 시작하는 경로는 접두사로 보지 않는다", () => {
    expect(routeLocale({ pathname: "/english" })).toEqual({
      type: "redirect",
      location: "/ko/english",
    });
  });
});
