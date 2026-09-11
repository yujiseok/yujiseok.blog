import Link from "next/link";
import { formatPostDate } from "@/lib/content/date";
import { isPublished, type PostMetadata } from "@/lib/content/document";

const PostRow = ({
  metadata,
  slug,
}: {
  metadata: PostMetadata;
  slug: string;
}) => {
  return (
    // 호버는 행 아래 구분선이 진해지는 것이다. 위아래 둘 다 바꾸면 행이
    // 상자처럼 갇혀 보여서 아래 선 하나만 반응한다.
    <li className="border-b border-neutral-200 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-100">
      <Link href={`/posts/${slug}`} className="block py-4">
        <h2 className="text-[17px] leading-7 font-medium tracking-[-0.01em] break-keep">
          {metadata.title}
          {/* 초안은 개발 서버에서만 목록에 닿는다(lib/content/repository.ts). 표시가 목록의
              리듬을 흔들지 않게 제목 뒤에 작은 라벨로만 붙인다. */}
          {!isPublished(metadata) && (
            <span className="ml-2 align-middle text-xs font-normal text-neutral-500 dark:text-neutral-400">
              초안
            </span>
          )}
        </h2>
        {/* 요약은 싣지 않는다. 목록에서 고르는 근거는 제목이고, 한 줄로 잘린
            요약은 그 판단을 돕지 못한 채 행만 무겁게 했다. */}
        <time
          dateTime={metadata.publishedAt}
          className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400"
        >
          {formatPostDate(metadata.publishedAt)}
        </time>
      </Link>
    </li>
  );
};
export default PostRow;
