import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllWritings,
  getWritingBySlug,
  importMdx,
} from "@/lib/content/repository";
import BlurContainer from "@/app/_components/blur-container";
import { TableOfContents } from "@/app/(main)/_components/table-of-contents";
import PostNav from "@/app/(main)/_components/post-nav";
import { getToc } from "@/lib/content/toc";
import { formatPostDate } from "@/lib/content/date";
import { getNeighbours } from "@/lib/content/neighbours";
import { SITE_URL } from "@/lib/constants";
import { alternates, SITE_OG } from "@/lib/metadata";

export async function generateStaticParams() {
  const writings = await getAllWritings();

  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await props.params;
  const writing = await getWritingBySlug(slug);

  if (!writing) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
  } = writing.metadata;

  return {
    title,
    description,
    alternates: alternates(`/posts/${writing.slug}`),
    openGraph: {
      title: { absolute: title },
      description,
      type: "article",
      publishedTime,
      url: `${SITE_URL}/posts/${writing.slug}`,
      ...SITE_OG,
    },
  };
}

const Post = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const writing = await getWritingBySlug(params.slug);
  if (!writing) {
    notFound();
  }

  // 목차는 원문을 다시 파싱해 만든다(lib/content/toc.ts). 본문은 모듈로 컴파일돼
  // 컴포넌트로 오므로 거기서 heading을 긁을 수 없다.
  const [{ default: Content }, toc, writings] = await Promise.all([
    importMdx("writing", params.slug),
    getToc("writing", params.slug),
    getAllWritings(),
  ]);

  const { older, newer } = getNeighbours(writings, params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: writing.metadata.title,
    description: writing.metadata.summary,
    datePublished: writing.metadata.publishedAt,
    url: `${SITE_URL}/posts/${params.slug}`,
    author: {
      "@type": "Person",
      name: "유지석",
      url: SITE_URL,
    },
  };

  return (
    <>
      {/* 목차는 최상위 제목만 보여준다. 하위까지 펴면 긴 글에서 목차가 본문보다
          길어지고, 훑는 용도로는 큰 단락만 있으면 충분하다. */}
      <TableOfContents entries={toc.filter(({ indent }) => indent === 0)} />
      <BlurContainer className="block gap-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // 제목에 </script>가 들어가면 스크립트가 조기 종료된다
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <header className="mb-10 w-full text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <time dateTime={writing.metadata.publishedAt}>
              {formatPostDate(writing.metadata.publishedAt)}
            </time>
            {/* 로컬 글쓰기 도구로 가는 지름길. 프로덕션 빌드에선 NODE_ENV가
                상수로 인라인돼 이 분기째로 사라진다. */}
            {process.env.NODE_ENV === "development" && (
              <Link
                href={`/editor?post=${params.slug}`}
                className="text-xs underline decoration-dashed underline-offset-2"
              >
                수정
              </Link>
            )}
          </div>
          <h1 className="mt-4 text-[clamp(2rem,8vw,4rem)] leading-none font-medium tracking-[-0.03em] break-keep">
            {writing.metadata.title}
          </h1>
        </header>

        <hr className="mx-auto max-w-2xl border-neutral-200 dark:border-neutral-800" />

        <p className="mx-auto mt-8 max-w-2xl text-[17px] leading-7 tracking-[-0.01em] break-keep text-neutral-600 dark:text-neutral-400">
          {writing.metadata.summary}
        </p>

        {/* scroll-mt는 해시 이동 시 제목이 화면 맨 위에 붙지 않게 한다.
            tableOfContents.tsx의 SCROLL_OFFSET(-32px)과 같은 값이다. */}
        <article className="prose dark:prose-invert prose-headings:scroll-mt-8 mx-auto mt-10 max-w-2xl">
          <Content />
        </article>

        <PostNav older={older} newer={newer} />
      </BlurContainer>
    </>
  );
};
export default Post;
