import { cn } from "@/lib/cn";
import { Metadata } from "@/lib/utils";
import Link from "next/link";

const Writing = ({
  metadata,
  slug,
  offset = true,
}: {
  metadata: Metadata;
  slug: string;
  offset?: boolean;
}) => {
  return (
    <article key={slug} className="rounded-lg">
      <Link
        href={`/writing/${slug}`}
        className={cn(
          "block rounded-lg p-3 transition-colors duration-50 hover:bg-black/5 dark:hover:bg-neutral-400/5",
          offset ? "-m-3" : "-ml-3",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="break-keep">{metadata.title}</h2>
          <time
            dateTime={metadata.publishedAt}
            className="shrink-0 text-xs text-neutral-600 md:text-sm dark:text-neutral-400"
          >
            {metadata.publishedAt}
          </time>
        </div>
      </Link>
    </article>
  );
};
export default Writing;
