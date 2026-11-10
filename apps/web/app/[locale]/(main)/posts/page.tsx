import type { Metadata } from "next";

import BlurContainer from "@/app/_components/blur-container";
import PostList from "@/app/[locale]/_components/post-list";
import { getAllWritings } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";
import { pageMetadata } from "@/lib/metadata";

const TITLE = "Posts";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await requireLocale(params);
  const description = getDictionary(locale).posts.description;

  return pageMetadata({
    locale,
    path: "/posts",
    title: TITLE,
    description,
    og: { title: TITLE },
  });
}

async function PostPage({ params }: LocaleParams) {
  const locale = await requireLocale(params);
  const writings = await getAllWritings(locale);

  return (
    <>
      <BlurContainer className="gap-4">
        {/* 목록 행의 글 제목이 h2다. h1이 없으면 계층이 비므로 크기가 아니라
            존재가 필요하다 — 라벨 크기로만 둔다. */}
        <h1 className="text-sm text-neutral-500 dark:text-neutral-400">
          {TITLE}
        </h1>

        <PostList writings={writings} locale={locale} />
      </BlurContainer>
    </>
  );
}
export default PostPage;
