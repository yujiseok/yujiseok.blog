// 페이지가 alternates를 선언하면 루트의 alternates가 통째로 교체되므로
// RSS 링크가 사라진다. canonical과 함께 항상 붙여준다.
export const alternates = (canonical: string) => ({
  canonical,
  types: { "application/rss+xml": "/rss.xml" },
});
