import { Metadata } from "@/lib/utils";
import Link from "next/link";

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

const PostRow = ({ metadata, slug }: { metadata: Metadata; slug: string }) => {
  return (
    // 호버는 행의 위아래 구분선이 진해지는 것이다. 구분선을 divide-y로 부모에
    // 두면 한 행이 자기 아래 선을 못 바꾸므로, 행마다 border-y를 갖고 -mb-px로
    // 이웃과 1px을 포갠다. 호버한 행을 위로 올려(z-10) 두 선이 모두 진해진다.
    <li className="relative -mb-px border-y border-neutral-200 transition-colors hover:z-10 hover:border-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-100">
      <Link href={`/posts/${slug}`} className="block py-4">
        <h2 className="text-[17px] leading-7 font-medium tracking-[-0.01em] break-keep">
          {metadata.title}
        </h2>
        {/* 요약은 한 줄까지만. 목록의 리듬은 제목이 쥔다. */}
        <p className="mt-0.5 line-clamp-1 text-[15px] break-keep text-neutral-600 dark:text-neutral-400">
          {metadata.summary}
        </p>
        <time
          dateTime={metadata.publishedAt}
          className="mt-2 block text-sm text-neutral-500 dark:text-neutral-400"
        >
          {formatPostDate(metadata.publishedAt)}
        </time>
      </Link>
    </li>
  );
};
export default PostRow;
