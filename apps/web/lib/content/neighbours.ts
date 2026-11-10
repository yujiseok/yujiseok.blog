export interface Neighbours<T> {
  /** 배열에서 한 칸 앞 — 최신순 정렬이므로 더 새 글 */
  newer: T | undefined;
  /** 배열에서 한 칸 뒤 — 최신순 정렬이므로 더 오래된 글 */
  older: T | undefined;
}

// getAllWritings()는 이미 publishedAt 내림차순이므로 인덱스만으로 이웃을 찾는다
export const getNeighbours = <T extends { slug: string }>(
  items: T[],
  slug: string,
): Neighbours<T> => {
  const index = items.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { newer: undefined, older: undefined };
  }

  return {
    newer: items[index - 1],
    older: items[index + 1],
  };
};
