import Link from "next/link";
import type { PostMetadata } from "@/lib/content/document";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

interface PostNavItem {
  slug: string;
  metadata: PostMetadata;
}

const PostNavCell = ({
  label,
  post,
  align,
  locale,
}: {
  label: string;
  post: PostNavItem | undefined;
  align: "left" | "right";
  locale: Locale;
}) => {
  if (!post) {
    // 이웃이 없어도 그리드가 2열을 유지하도록 빈 칸을 그대로 둔다
    return <div />;
  }

  return (
    <Link
      href={localizedPath(locale, `/posts/${post.slug}`)}
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
  locale,
}: {
  older: PostNavItem | undefined;
  newer: PostNavItem | undefined;
  locale: Locale;
}) => {
  const { postNav } = getDictionary(locale);

  return (
    <nav
      aria-label={postNav.label}
      className="mx-auto mt-16 max-w-2xl border-t border-neutral-200 pt-6 dark:border-neutral-800"
    >
      <div className="grid grid-cols-2 gap-6">
        <PostNavCell
          label={postNav.older}
          post={older}
          align="left"
          locale={locale}
        />
        <PostNavCell
          label={postNav.newer}
          post={newer}
          align="right"
          locale={locale}
        />
      </div>
    </nav>
  );
};

export default PostNav;
