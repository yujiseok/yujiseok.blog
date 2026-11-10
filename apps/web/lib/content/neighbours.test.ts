import { describe, expect, it } from "vitest";

import { getNeighbours } from "./neighbours";

const items = [{ slug: "c" }, { slug: "b" }, { slug: "a" }];

describe("getNeighbours", () => {
  it.each([
    ["가장 최신 글은 newer가 없다", "c", undefined, { slug: "b" }],
    ["가장 오래된 글은 older가 없다", "a", { slug: "b" }, undefined],
    [
      "가운데 글은 newer와 older가 모두 있다",
      "b",
      { slug: "c" },
      { slug: "a" },
    ],
  ])("%s", (_name, slug, newer, older) => {
    expect(getNeighbours(items, slug)).toEqual({ newer, older });
  });

  it("존재하지 않는 slug는 둘 다 없다", () => {
    expect(getNeighbours(items, "z")).toEqual({
      newer: undefined,
      older: undefined,
    });
  });
});
