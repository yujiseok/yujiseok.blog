import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES, localizedPath, type Locale } from "@/lib/i18n/locales";

// 기존 구독자를 위해 한국어 피드는 옛 주소를 그대로 둔다.
export const rssPath = (locale: Locale) =>
  locale === "ko" ? "/rss.xml" : `/${locale}/rss.xml`;

interface AlternatesOptions {
  /** 이 경로가 실제로 존재하는 언어. 번역이 없는 글을 올리면 hreflang이 404를 가리킨다 */
  available?: readonly Locale[];
  /** 에이전트가 HTML 대신 원문을 찾도록 `.md` 대체 링크를 단다 */
  markdown?: boolean;
}

/*
 * 페이지가 alternates를 선언하면 루트의 alternates가 통째로 교체되므로
 * RSS 링크가 사라진다. canonical·hreflang·RSS를 항상 함께 붙인다.
 * x-default는 항상 ko다.
 */
export const alternates = (
  locale: Locale,
  path: string,
  { available = LOCALES, markdown = false }: AlternatesOptions = {},
) => ({
  canonical: localizedPath(locale, path),
  languages: {
    ...Object.fromEntries(
      available.map((l) => [l, localizedPath(l, path)] as const),
    ),
    "x-default": localizedPath("ko", path),
  },
  types: {
    "application/rss+xml": rssPath(locale),
    ...(markdown && {
      "text/markdown": `${localizedPath(locale, path)}.md`,
    }),
  },
});

// openGraph도 마찬가지로 통째 교체된다. 사이트 정체성은 여기서만 관리한다.
export const siteOg = (locale: Locale) => {
  const { site } = getDictionary(locale);

  return { siteName: site.name, locale: site.ogLocale } as const;
};
