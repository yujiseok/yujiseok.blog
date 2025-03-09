import { Metadata } from "@/lib/utils";
import Link from "next/link";

const Post = ({
  metadata,
  slug,
}: {
  metadata: Metadata;
  slug: string;
  index: number;
}) => {
  return (
    <article key={slug} className="rounded-lg">
      <Link
        href={`/post/${slug}`}
        className="-m-3 block rounded-lg p-3 transition-colors duration-250 ease-out hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold break-keep md:text-lg">
            {metadata.title}
          </h2>
          <time
            dateTime={metadata.publishedAt}
            className="shrink-0 text-xs text-neutral-600 md:text-sm dark:text-neutral-400"
          >
            {metadata.publishedAt}
          </time>
        </div>
        <p className="my-1 text-xs font-normal break-keep text-neutral-600 md:text-sm dark:text-neutral-400">
          {metadata.summary}
        </p>
      </Link>
    </article>
  );
};
export default Post;
