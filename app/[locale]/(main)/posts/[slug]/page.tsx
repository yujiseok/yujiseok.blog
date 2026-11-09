import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getAllWritings,
  getTranslatedSlugs,
  getWritingBySlug,
  importMdx,
} from "@/lib/content/repository";
import BlurContainer from "@/app/_components/blur-container";
import { TableOfContents } from "@/app/[locale]/(main)/_components/table-of-contents";
import PostNav from "@/app/[locale]/(main)/_components/post-nav";
import { getToc } from "@/lib/content/toc";
import { formatPostDate } from "@/lib/content/date";
import { getNeighbours } from "@/lib/content/neighbours";
import { SITE_URL } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale } from "@/lib/i18n/params";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { alternates, siteOg } from "@/lib/metadata";
import { blogPostingJsonLd } from "@/lib/seo/json-ld";

interface PostParams {
  params: Promise<{ locale: string; slug: string }>;
}

/*
 * locale과 slug를 한 번에 낸다. 번역이 하나도 없어도 ko 글이 있으므로 비지 않는다
 * (cacheComponents는 빈 배열이면 빌드가 깨진다). 번역이 없는 en slug는 목록에
 * 없어 요청 때 getWritingBySlug가 못 찾고 404가 된다.
 */
export async function generateStaticParams() {
  const [ko, en] = await Promise.all([
    getAllWritings("ko"),
    getTranslatedSlugs(),
  ]);

  return [
    ...ko.map(({ slug }) => ({ locale: "ko", slug })),
    ...[...en].map((slug) => ({ locale: "en", slug })),
  ];
}

export async function generateMetadata(
  props: PostParams,
): Promise<Metadata | undefined> {
  const locale = await requireLocale(props.params);
  const { slug } = await props.params;
  const writing = await getWritingBySlug(slug, locale);

  if (!writing) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
  } = writing.metadata;
  const path = `/posts/${writing.slug}`;
  // 번역이 없는 글을 hreflang에 올리면 404를 가리킨다
  const translated = (await getTranslatedSlugs()).has(slug);

  return {
    title,
    description,
    alternates: alternates(locale, path, {
      available: translated ? ["ko", "en"] : ["ko"],
      markdown: true,
    }),
    openGraph: {
      title: { absolute: title },
      description,
      type: "article",
      publishedTime,
      url: `${SITE_URL}${localizedPath(locale, path)}`,
      ...siteOg(locale),
    },
  };
}

const Post = (props: PostParams) => {
  // slug는 링크마다 달라 경로 공통 껍데기에 넣을 수 없다. 본문을 Suspense
  // 안에서 읽어야 이동이 그 값을 기다리며 막히지 않는다.
  return (
    <Suspense fallback={null}>
      <PostContent params={props.params} />
    </Suspense>
  );
};

const PostContent = async (props: PostParams) => {
  const locale = await requireLocale(props.params);
  const { slug } = await props.params;
  const writing = await getWritingBySlug(slug, locale);
  if (!writing) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  // 목차는 원문을 다시 파싱해 만든다(lib/content/toc.ts). 본문은 모듈로 컴파일돼
  // 컴포넌트로 오므로 거기서 heading을 긁을 수 없다.
  const [{ default: Content }, toc, writings] = await Promise.all([
    importMdx("writing", slug, locale),
    getToc("writing", slug, locale),
    getAllWritings(locale),
  ]);

  const { older, newer } = getNeighbours(writings, slug);

  return (
    <>
      {/* 목차는 최상위 제목만 보여준다. 하위까지 펴면 긴 글에서 목차가 본문보다
          길어지고, 훑는 용도로는 큰 단락만 있으면 충분하다. */}
      <TableOfContents
        entries={toc.filter(({ indent }) => indent === 0)}
        label={dictionary.toc.label}
      />
      <BlurContainer className="block gap-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // 제목에 </script>가 들어가면 스크립트가 조기 종료된다
            __html: JSON.stringify(
              blogPostingJsonLd(locale, slug, writing.metadata),
            ).replace(/</g, "\\u003c"),
          }}
        />
        <header className="mb-10 w-full text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <time dateTime={writing.metadata.publishedAt}>
              {formatPostDate(writing.metadata.publishedAt, locale)}
            </time>
            {/* 로컬 글쓰기 도구로 가는 지름길. 프로덕션 빌드에선 NODE_ENV가
                상수로 인라인돼 이 분기째로 사라진다. */}
            {process.env.NODE_ENV === "development" && (
              <Link
                href={`/editor?post=${slug}`}
                className="text-xs underline decoration-dashed underline-offset-2"
              >
                {dictionary.posts.edit}
              </Link>
            )}
          </div>
          <h1 className="mt-4 text-[clamp(2rem,8vw,4rem)] leading-none font-medium tracking-[-0.03em] break-keep">
            {writing.metadata.title}
          </h1>
        </header>

        <hr className="mx-auto max-w-2xl border-neutral-200 dark:border-neutral-800" />

        {writing.metadata.summary && (
          <p className="mx-auto mt-8 max-w-2xl text-[17px] leading-7 tracking-[-0.01em] break-keep text-neutral-600 dark:text-neutral-400">
            {writing.metadata.summary}
          </p>
        )}

        {locale === "en" && <TranslationNotice slug={slug} locale={locale} />}

        {/* scroll-mt는 해시 이동 시 제목이 화면 맨 위에 붙지 않게 한다.
            tableOfContents.tsx의 SCROLL_OFFSET(-32px)과 같은 값이다. */}
        <article className="prose dark:prose-invert prose-headings:scroll-mt-8 mx-auto mt-10 max-w-2xl">
          <Content />
        </article>

        <PostNav older={older} newer={newer} locale={locale} />
      </BlurContainer>
    </>
  );
};

// 번역본에만 단다. 안내 문구는 MDX가 아니라 사전에 있어 번역 파이프라인과 무관하다.
const TranslationNotice = ({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) => {
  const { posts } = getDictionary(locale);

  return (
    <p className="mx-auto mt-6 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
      {posts.translatedNotice}{" "}
      {/* 언어 선택을 바꾸는 링크가 아니라서 쿠키를 남기지 않는다 */}
      <Link
        href={localizedPath("ko", `/posts/${slug}`)}
        hrefLang="ko"
        prefetch={false}
        className="underline underline-offset-2"
      >
        {posts.readOriginal} →
      </Link>
    </p>
  );
};

export default Post;
