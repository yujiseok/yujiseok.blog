import Link from "next/link";
import BlurContainer from "../components/blurContainer";
import PostRow from "../components/postRow";
import { getAllWritings } from "@/lib/utils";
import ArrowUpRight from "../components/arrowUpRight";

export default async function Home() {
  const writings = (await getAllWritings()).slice(0, 8);

  return (
    <BlurContainer className="gap-10 break-keep">
      <header>
        <h1 className="text-lg font-medium">유지석</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Frontend Engineer
        </p>
      </header>

      <div>
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {writings.map(({ metadata, slug }) => (
            <PostRow key={slug} metadata={metadata} slug={slug} />
          ))}
        </ul>
        <div className="flex justify-end">
          <Link
            href="/posts"
            className="group mt-4 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span>더 보기</span>
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </BlurContainer>
  );
}
