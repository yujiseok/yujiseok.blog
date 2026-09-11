import Link from "next/link";
import type { Metadata } from "next";
import BlurContainer from "@/app/_components/blur-container";
import PostRow from "@/app/(main)/_components/post-row";
import Footer from "@/app/_components/footer";
import { getAllWritings } from "@/lib/content/repository";

export const metadata: Metadata = { title: "404" };

// 루트의 not-found는 app/(main)/layout.tsx를 타지 않는다 — 그 레이아웃 밖에
// 있는 라우트라 Footer를 여기서 직접 그려야 같은 틀 안에 있는 것처럼 보인다.
export default async function NotFound() {
  const writings = (await getAllWritings()).slice(0, 5);

  return (
    <>
      <main id="content" className="mx-auto mt-24 w-full max-w-2xl sm:mt-28">
        <BlurContainer className="gap-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold">404</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              페이지를 찾을 수 없습니다.
            </p>
            <Link
              href="/"
              className="w-fit text-sm underline underline-offset-2"
            >
              홈으로 돌아가기
            </Link>
          </header>

          <div>
            <h2 className="text-sm text-neutral-500 dark:text-neutral-400">
              최근 글
            </h2>
            <ul>
              {writings.map(({ metadata, slug }) => (
                <PostRow key={slug} metadata={metadata} slug={slug} />
              ))}
            </ul>
          </div>
        </BlurContainer>
      </main>
      <Footer />
    </>
  );
}
