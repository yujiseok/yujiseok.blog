import { describe, expect, it } from "vitest";

import { getNeighbours } from "./neighbours";

const items = [{ slug: "c" }, { slug: "b" }, { slug: "a" }];

describe("getNeighbours", () => {
  it("가장 최신 글은 newer가 없다", () => {
    expect(getNeighbours(items, "c")).toEqual({
      newer: undefined,
      older: { slug: "b" },
    });
  });

  it("가장 오래된 글은 older가 없다", () => {
    expect(getNeighbours(items, "a")).toEqual({
      newer: { slug: "b" },
      older: undefined,
    });
  });

  it("가운데 글은 newer와 older가 모두 있다", () => {
    expect(getNeighbours(items, "b")).toEqual({
      newer: { slug: "c" },
      older: { slug: "a" },
    });
  });

  it("존재하지 않는 slug는 둘 다 없다", () => {
    expect(getNeighbours(items, "z")).toEqual({
      newer: undefined,
      older: undefined,
    });
  });
});
