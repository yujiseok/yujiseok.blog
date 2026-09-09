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
    <li>
      <Link
        href={`/posts/${slug}`}
        className="-mx-3 block rounded-lg px-3 py-4 transition-colors duration-50 hover:bg-black/5 dark:hover:bg-neutral-200/10"
      >
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
