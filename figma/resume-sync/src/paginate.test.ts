import { describe, expect, it } from "vitest";

import { paginate, type Block } from "./paginate";

const block = (height: number, extra: Partial<Block> = {}): Block => ({
  height,
  gapBefore: 10,
  keepWithNext: false,
  section: "exp",
  isSectionHead: false,
  ...extra,
});
const head = (section = "exp") =>
  block(30, { keepWithNext: true, isSectionHead: true, section });
const options = {
  pageHeight: 300,
  sectionHeadHeight: () => 30,
  continuationGap: 10,
};

describe("paginate", () => {
  it("한 쪽에 들어가면 그대로 둔다", () => {
    const pages = paginate([head(), block(100), block(100)], options);

    expect(pages).toEqual([{ blocks: [0, 1, 2], continuedSection: null }]);
  });

  it("넘치는 블록은 다음 쪽으로 보내고 순서를 지킨다", () => {
    const pages = paginate(
      [head(), block(100), block(100), block(100)],
      options,
    );

    expect(pages.flatMap((p) => p.blocks)).toEqual([0, 1, 2, 3]);
    expect(pages[0].blocks).toEqual([0, 1, 2]);
    expect(pages[1].blocks).toEqual([3]);
  });

  it("섹션 중간에서 넘어가면 그 섹션 제목을 다시 단다", () => {
    const pages = paginate(
      [head(), block(100), block(100), block(100)],
      options,
    );

    expect(pages[1].continuedSection).toBe("exp");
  });

  it("섹션 제목은 쪽 맨 아래에 홀로 남지 않는다", () => {
    const pages = paginate(
      [
        head("a"),
        block(200, { section: "a" }),
        head("b"),
        block(80, { section: "b" }),
      ],
      options,
    );

    expect(pages[0].blocks).toEqual([0, 1]);
    expect(pages[1]).toEqual({ blocks: [2, 3], continuedSection: null });
  });

  it("쪽 높이를 넘기지 않는다", () => {
    const blocks = [head(), ...Array.from({ length: 12 }, () => block(70))];
    const pages = paginate(blocks, options);

    for (const page of pages) {
      const used = page.blocks.reduce(
        (sum, i, k) =>
          sum + blocks[i].height + (k > 0 ? blocks[i].gapBefore : 0),
        page.continuedSection ? 30 + options.continuationGap : 0,
      );
      expect(used).toBeLessThanOrEqual(options.pageHeight);
    }
  });

  it("한 쪽보다 큰 블록은 쪼개지 않고 혼자 둔다", () => {
    const pages = paginate([block(500), block(50)], options);

    expect(pages.map((p) => p.blocks)).toEqual([[0], [1]]);
  });
});
