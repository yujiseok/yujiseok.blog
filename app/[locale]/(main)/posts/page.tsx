import type { Metadata } from "next";

import BlurContainer from "@/app/_components/blur-container";
import PostRow from "@/app/[locale]/(main)/_components/post-row";
import { SITE_URL } from "@/lib/constants";
import { getAllWritings } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale } from "@/lib/i18n/params";
import { localizedPath } from "@/lib/i18n/locales";
import { alternates, siteOg } from "@/lib/metadata";

const TITLE = "Posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await requireLocale(params);
  const description = getDictionary(locale).posts.description;

  return {
    title: TITLE,
    description,
    alternates: alternates(locale, "/posts"),
    openGraph: {
      title: TITLE,
      description,
      url: `${SITE_URL}${localizedPath(locale, "/posts")}`,
      type: "website",
      ...siteOg(locale),
    },
  };
}

async function PostPage({ params }: { params: Promise<{ locale: string }> }) {
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

        <ul>
          {writings.map(({ metadata, slug }) => (
            <PostRow
              key={slug}
              metadata={metadata}
              slug={slug}
              locale={locale}
            />
          ))}
        </ul>
      </BlurContainer>
    </>
  );
}
export default PostPage;
