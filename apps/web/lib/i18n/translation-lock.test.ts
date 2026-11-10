import { describe, expect, it } from "vitest";

import { translationStatus } from "./translation-lock";

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

  it.each([
    ["lock 에 기록이 없으면", {}, "h1"],
    ["해시가 다르면", { [key]: "h1" }, "h2"],
  ])("파일이 있어도 %s stale", (_name, lock, hash) => {
    expect(translationStatus({ key, hash, exists: true, lock })).toBe("stale");
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
