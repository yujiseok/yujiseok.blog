import { SITE_URL } from "@/lib/constants";
import type { PostMetadata } from "@/lib/content/document";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export const blogPostingJsonLd = (
  locale: Locale,
  slug: string,
  { title, summary, publishedAt }: PostMetadata,
) => {
  const url = `${SITE_URL}${localizedPath(locale, `/posts/${slug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: summary,
    datePublished: publishedAt,
    // 수정일을 따로 기록하지 않는다. 비워 두면 구글이 경고하므로 발행일로 채운다
    dateModified: publishedAt,
    inLanguage: locale,
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: getDictionary(locale).site.name,
      url: SITE_URL,
      sameAs: ["https://github.com/yujiseok"],
    },
  };
};
