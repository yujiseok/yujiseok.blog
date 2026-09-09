import Link from "next/link";
import type { Metadata } from "@/lib/utils";

interface PostNavItem {
  slug: string;
  metadata: Metadata;
}

const PostNavCell = ({
  label,
  post,
  align,
}: {
  label: string;
  post: PostNavItem | undefined;
  align: "left" | "right";
}) => {
  if (!post) {
    // 이웃이 없어도 그리드가 2열을 유지하도록 빈 칸을 그대로 둔다
    return <div />;
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={align === "right" ? "block text-right" : "block"}
    >
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="mt-1 block text-[17px] leading-7 font-medium break-keep hover:underline hover:underline-offset-4">
        {post.metadata.title}
      </span>
    </Link>
  );
};

const PostNav = ({
  older,
  newer,
}: {
  older: PostNavItem | undefined;
  newer: PostNavItem | undefined;
}) => {
  return (
    <nav
      aria-label="이전 · 다음 글"
      className="mx-auto mt-16 max-w-2xl border-t border-neutral-200 pt-6 dark:border-neutral-800"
    >
      <div className="grid grid-cols-2 gap-6">
        <PostNavCell label="이전 글" post={older} align="left" />
        <PostNavCell label="다음 글" post={newer} align="right" />
      </div>
    </nav>
  );
};

export default PostNav;
