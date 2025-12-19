import Link from "next/link";
import BlurContainer from "../components/blurContainer";
import Writing from "../components/writing";
import { getAllWritings } from "@/lib/utils";
import ArrowUpRight from "../components/arrowUpRight";

export default function Home() {
  const writings = getAllWritings().slice(0, 10);

  return (
    <BlurContainer className="gap-10 leading-7 break-keep">
      <header>
        <div>
          <h1 className="text-lg font-semibold">유지석</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Frontend Engineer
          </p>
        </div>
      </header>

      <div>
        <div>
          {writings.map(({ metadata, slug }) => (
            <Writing
              key={slug}
              metadata={metadata}
              slug={slug}
              offset={false}
            />
          ))}
        </div>
        <div className="flex justify-end">
          <Link
            href="/writing"
            className="group mt-2 mr-3 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span>더 보기</span>
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </BlurContainer>
  );
}
