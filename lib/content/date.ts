const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  // publishedAt은 'YYYY-MM-DD'라 UTC 자정으로 파싱된다. 로컬 존으로 읽으면
  // 서버(UTC)와 브라우저(KST)가 하루 어긋나 하이드레이션이 깨진다.
  timeZone: "UTC",
});

/** 잘못된 날짜는 Invalid Date를 내보내는 대신 원문을 그대로 남긴다. */
export const formatPostDate = (publishedAt: string) => {
  const date = new Date(publishedAt);

  return Number.isNaN(date.getTime())
    ? publishedAt
    : DATE_FORMATTER.format(date);
};
