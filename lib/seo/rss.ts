import { SITE_URL } from "@/lib/constants";
import type { PostMetadata } from "@/lib/content/document";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { rssPath } from "@/lib/metadata";

interface RssPost {
  slug: string;
  metadata: PostMetadata;
}

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/*
 * guid는 URL일 필요가 없고 안정적인 고유 문자열이기만 하면 된다. ko 피드는
 * /writing → /posts → /ko/posts로 주소가 바뀌어도 옛 /writing 주소를 그대로 박아
 * 둔다. 바꾸면 구독자 리더가 기존 글 전부를 새 글로 다시 띄운다(리더는 guid로
 * 식별하므로 리다이렉트로는 막을 수 없다). en 피드는 새 피드라 현재 주소를 쓴다.
 */
const guid = (locale: Locale, slug: string) =>
  locale === "ko"
    ? `${SITE_URL}/writing/${slug}`
    : `${SITE_URL}${localizedPath(locale, `/posts/${slug}`)}`;

export const buildRss = (locale: Locale, posts: RssPost[]): string => {
  const { feeds, site } = getDictionary(locale);

  const items = posts
    .map(
      ({ slug, metadata }) => `<item>
          <title>${escapeXml(metadata.title)}</title>
          <link>${SITE_URL}${localizedPath(locale, `/posts/${slug}`)}</link>
          <guid isPermaLink="false">${guid(locale, slug)}</guid>
          ${metadata.summary ? `<description>${escapeXml(metadata.summary)}</description>` : ""}
          <author>yujiseok</author>
          <pubDate>${new Date(metadata.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" ?>
   <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escapeXml(feeds.rssTitle)}</title>
        <link>${SITE_URL}${localizedPath(locale, "/")}</link>
        <description>${escapeXml(site.description)}</description>
        <language>${feeds.rssLanguage}</language>
        <atom:link href="${SITE_URL}${rssPath(locale)}" rel="self" type="application/rss+xml"/>
        ${items}
      </channel>
    </rss>`;
};
