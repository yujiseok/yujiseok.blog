import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

import { SITE_URL } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

import { isPublished, parsePost, type PostMetadata } from "./document";
import { toMarkdown } from "./markdown";
import { listLocaleFiles, LOCALE_SUFFIX } from "./translation-path";

export { listLocaleFiles };

type ContentType = "writing" | "atelier";

interface MdxModule {
  default: ComponentType;
  metadata: PostMetadata;
}

const ROOT_DIR = path.join(process.cwd(), "content");

/*
 * 원문은 `slug.mdx`(ko), 번역은 `slug.en.mdx`. atelier는 번역 대상이 아니라
 * 어느 언어로 불러도 원문을 읽는다 — en 목록이 비면 generateStaticParams가
 * 빈 배열이 되어 cacheComponents 빌드가 깨지기도 한다.
 */
const contentLocale = (contentType: ContentType, locale: Locale): Locale =>
  contentType === "atelier" ? DEFAULT_LOCALE : locale;

/** `content/<type>/` 아래의 파일명. toc처럼 원문을 직접 읽는 쪽이 쓴다. */
export const contentFileName = (
  contentType: ContentType,
  slug: string,
  locale: Locale,
) => `${slug}${LOCALE_SUFFIX[contentLocale(contentType, locale)]}.mdx`;

// 템플릿 리터럴의 앞부분이 정적이어야 번들러가 모듈을 찾을 수 있어 분기한다
export const importMdx = (
  contentType: ContentType,
  slug: string,
  locale: Locale,
): Promise<MdxModule> =>
  contentType === "writing"
    ? import(`@/content/writing/${slug}${LOCALE_SUFFIX[locale]}.mdx`)
    : import(`@/content/atelier/${slug}.mdx`);

export interface ContentEntry {
  metadata: PostMetadata;
  slug: string;
}

/*
 * 번역본의 published는 번역 시점의 값이라 원문이 나중에 비공개로 돌아가도
 * true로 남는다. 번역본은 원문이 있고 공개 상태일 때만 보인다 — 원문 없이
 * 남은 .en.mdx(고아)도 여기서 걸러진다. 초안을 보여 주는 모드에서는 원문이
 * 비공개여도 번역본을 남긴다.
 */
export const requireSource = <T extends ContentEntry>(
  translations: T[],
  sources: ContentEntry[],
  includeDrafts: boolean,
): T[] =>
  translations.filter(({ slug }) => {
    const source = sources.find((entry) => entry.slug === slug);

    return source !== undefined && (includeDrafts || isPublished(source.metadata));
  });

const readEntries = (contentType: ContentType, locale: Locale) =>
  fs.readdir(path.join(ROOT_DIR, contentType)).then((files) =>
    Promise.all(
      listLocaleFiles(files, locale).map(async ({ file, slug }) => {
        const source = await fs.readFile(
          path.join(ROOT_DIR, contentType, file),
          "utf8",
        );

        return { metadata: parsePost(source).metadata, slug };
      }),
    ),
  );

/*
 * 목록 페이지·RSS·sitemap·llms.txt는 메타데이터만 있으면 된다. importMdx로
 * 모듈을 평가하면 컴파일된 shiki HTML까지 포함한 본문 전체가 딸려 온다 —
 * 24개 글을 전부 읽을 때마다 그 비용을 치를 이유가 없다. lib/content/toc.ts와 같은
 * 방식으로 원문만 읽어 metadata export만 떼어낸다.
 */
export const readAllContent = async (
  contentType: ContentType,
  {
    locale,
    includeDrafts = false,
  }: { locale: Locale; includeDrafts?: boolean },
) => {
  const effective = contentLocale(contentType, locale);
  const own = (await readEntries(contentType, effective)).filter(
    ({ metadata }) => includeDrafts || isPublished(metadata),
  );
  const visible =
    effective === DEFAULT_LOCALE
      ? own
      : requireSource(
          own,
          await readEntries(contentType, DEFAULT_LOCALE),
          includeDrafts,
        );

  return visible.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );
};

/*
 * 개발 서버에서만 초안을 남긴다. 쓰는 중인 글을 실제 화면으로 확인하기 위한
 * 것이고, 프로덕션 빌드에서는 목록·홈·RSS·sitemap·llms.txt·이웃 글·상세
 * 어디에도 남지 않는다 — 그 경로가 모두 이 함수를 지나기 때문이다.
 */
const INCLUDE_DRAFTS = process.env.NODE_ENV === "development";

const getAllContent = async (contentType: ContentType, locale: Locale) => {
  "use cache";

  return readAllContent(contentType, {
    locale,
    includeDrafts: INCLUDE_DRAFTS,
  });
};

/** en에는 번역본이 있는 글만 나온다. 번역이 없는 slug는 en에서 없는 글이다. */
export const getAllWritings = (locale: Locale) =>
  getAllContent("writing", locale);

/** 번역본이 있는 글의 slug. 언어 토글·hreflang·이력서 링크가 번역 유무를 가를 때 쓴다. */
export const getTranslatedSlugs = async () =>
  new Set((await getAllWritings("en")).map(({ slug }) => slug));

export const getWritingBySlug = async (slug: string, locale: Locale) =>
  (await getAllWritings(locale)).find((writing) => writing.slug === slug);

/*
 * 에이전트용 마크다운 원문(/posts/<slug>.md, /llms-full.txt). 목록에 있는 slug만
 * 읽으므로 초안 필터와 slug 검증을 getAllWritings에 그대로 맡긴다.
 */
export const getWritingMarkdown = async (slug: string, locale: Locale) => {
  const writing = await getWritingBySlug(slug, locale);

  if (!writing) {
    return;
  }

  const source = await fs.readFile(
    path.join(ROOT_DIR, "writing", contentFileName("writing", slug, locale)),
    "utf8",
  );

  return toMarkdown({
    ...writing.metadata,
    url: `${SITE_URL}/${locale}/posts/${writing.slug}`,
    body: parsePost(source).body,
  });
};

export const getAllAtelier = () => getAllContent("atelier", DEFAULT_LOCALE);

export const getAtelierBySlug = async (slug: string) =>
  (await getAllAtelier()).find((atelier) => atelier.slug === slug);
