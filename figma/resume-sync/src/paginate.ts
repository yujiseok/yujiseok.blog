/*
 * 이력서 블록을 A4 쪽에 나눠 담는다. Figma API에 기대지 않는 순수 함수라 vitest로 검사한다.
 *
 * - 블록은 쪼개지 않는다. 한 쪽보다 큰 블록은 넘치는 채로 그 쪽에 둔다.
 * - keepWithNext 블록(섹션 제목·회사 머리)은 다음 블록과 같은 쪽에 둔다.
 * - 섹션 중간에서 쪽이 바뀌면 그 쪽 맨 위에 섹션 제목을 다시 단다(continuedSection).
 *   이때 첫 블록 앞 간격은 continuationGap으로 바뀐다.
 * - 쪽 맨 위 블록의 gapBefore는 쓰지 않는다.
 */
export type Block = {
  height: number;
  gapBefore: number;
  keepWithNext: boolean;
  section: string | null;
  isSectionHead: boolean;
};

export type Page = {
  blocks: number[];
  continuedSection: string | null;
};

export type PaginateOptions = {
  pageHeight: number;
  sectionHeadHeight: (section: string) => number;
  continuationGap: number;
};

export const paginate = (
  blocks: readonly Block[],
  { pageHeight, sectionHeadHeight, continuationGap }: PaginateOptions,
): Page[] => {
  const pages: Page[] = [];
  let page: Page = { blocks: [], continuedSection: null };
  let used = 0;

  for (let start = 0; start < blocks.length;) {
    let end = start;
    while (end < blocks.length - 1 && blocks[end].keepWithNext) end++;

    // 그룹 첫 블록 앞 간격을 뺀 그룹 높이
    let body = 0;
    for (let i = start; i <= end; i++) {
      body += blocks[i].height + (i > start ? blocks[i].gapBefore : 0);
    }

    const first = blocks[start];
    const fits =
      page.blocks.length === 0 || used + first.gapBefore + body <= pageHeight;

    if (fits) {
      used += (page.blocks.length === 0 ? 0 : first.gapBefore) + body;
    } else {
      pages.push(page);
      const continued = first.isSectionHead ? null : first.section;
      page = { blocks: [], continuedSection: continued };
      used =
        (continued ? sectionHeadHeight(continued) + continuationGap : 0) + body;
    }

    for (let i = start; i <= end; i++) page.blocks.push(i);
    start = end + 1;
  }

  if (page.blocks.length > 0) pages.push(page);
  return pages;
};
