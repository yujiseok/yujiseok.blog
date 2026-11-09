import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import type { ContentEntry } from "@/lib/content/repository";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { alternates } from "@/lib/metadata";

interface SitemapInput {
  ko: ContentEntry[];
  /** 번역이 있는 글만 */
  en: ContentEntry[];
  atelier: ContentEntry[];
}

type Item = MetadataRoute.Sitemap[number];

const PAGES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/posts", changeFrequency: "weekly", priority: 0.9 },
  { path: "/atelier", changeFrequency: "monthly", priority: 0.7 },
  { path: "/resume", changeFrequency: "monthly", priority: 0.6 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.6 },
  { path: "/music", changeFrequency: "daily", priority: 0.5 },
] as const;

const entry = (
  locale: Locale,
  path: string,
  available: readonly Locale[],
  rest: Omit<Item, "url" | "alternates">,
): Item => {
  const { canonical, languages } = alternates(locale, path, { available });

  return {
    url: `${SITE_URL}${canonical}`,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(languages).map(([lang, href]) => [
          lang,
          `${SITE_URL}${href}`,
        ]),
      ),
    },
    ...rest,
  };
};

/*
 * 렌더 중 new Date()를 쓰면 cacheComponents가 이 라우트를 dynamic으로 만든다.
 * 목록 페이지는 최신 콘텐츠 날짜를, 나머지는 lastModified를 생략한다.
 * 번역이 없는 글은 en URL도, en 대체 언어도 내지 않는다(404를 가리키게 된다).
 */
export const buildSitemap = ({ ko, en, atelier }: SitemapInput): Item[] => {
  const translated = new Set(en.map(({ slug }) => slug));
  const latest = {
    "/": ko[0]?.metadata.publishedAt,
    "/posts": ko[0]?.metadata.publishedAt,
    "/atelier": atelier[0]?.metadata.publishedAt,
  } as Record<string, string | undefined>;

  const pages = LOCALES.flatMap((locale) =>
    PAGES.map(({ path, ...rest }) =>
      entry(locale, path, LOCALES, { ...rest, lastModified: latest[path] }),
    ),
  );

  const writings = ko.flatMap(({ slug, metadata }) => {
    const available: readonly Locale[] = translated.has(slug)
      ? LOCALES
      : ["ko"];

    return available.map((locale) =>
      entry(locale, `/posts/${slug}`, available, {
        lastModified: metadata.publishedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    );
  });

  const ateliers = atelier.flatMap(({ slug, metadata }) =>
    LOCALES.map((locale) =>
      entry(locale, `/atelier/${slug}`, LOCALES, {
        lastModified: metadata.publishedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
  );

  return [...pages, ...writings, ...ateliers];
};
