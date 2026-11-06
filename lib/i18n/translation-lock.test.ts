import { describe, expect, it } from "vitest";

import { hashSource, translationStatus } from "./translation-lock";

describe("hashSource", () => {
  it("알려진 입력에 대해 sha256 hex 를 돌려준다", () => {
    expect(hashSource("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("translationStatus", () => {
  const key = "writing/spotify";

  it(".en.mdx 가 없으면 missing", () => {
    expect(
      translationStatus({
        key,
        hash: "h1",
        exists: false,
        lock: { [key]: "h1" },
      }),
    ).toBe("missing");
  });

  it("파일이 있어도 lock 에 기록이 없으면 stale", () => {
    expect(translationStatus({ key, hash: "h1", exists: true, lock: {} })).toBe(
      "stale",
    );
  });

  it("해시가 다르면 stale", () => {
    expect(
      translationStatus({
        key,
        hash: "h2",
        exists: true,
        lock: { [key]: "h1" },
      }),
    ).toBe("stale");
  });

  it("파일이 있고 해시가 같으면 fresh", () => {
    expect(
      translationStatus({
        key,
        hash: "h1",
        exists: true,
        lock: { [key]: "h1" },
      }),
    ).toBe("fresh");
  });
});
