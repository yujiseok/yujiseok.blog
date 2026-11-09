import { SITE_URL } from "@/lib/constants";
import type { ContentEntry } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

interface LlmsInput {
  ko: ContentEntry[];
  /** 번역이 있는 글만 */
  en: ContentEntry[];
}

const describe = (summary?: string) => (summary ? `: ${summary}` : "");

const postLinks = (locale: Locale, posts: ContentEntry[]) =>
  posts
    .map(
      ({ slug, metadata }) =>
        // llms.txt 관례대로 HTML 대신 마크다운 원문을 가리킨다
        `- [${metadata.title}](${SITE_URL}${localizedPath(locale, `/posts/${slug}`)}.md)${describe(metadata.summary)}`,
    )
    .join("\n");

export const buildLlmsTxt = ({ ko, en }: LlmsInput) => {
  const { feeds } = getDictionary("ko");
  const hasEnglish = en.length > 0;

  return `# Yujiseok's Blog

> ${feeds.llmsSummary}

${feeds.llmsIntro}

## Writing

${postLinks("ko", ko)}
${
  hasEnglish
    ? `
## Writing (English)

AI-translated from the Korean originals.

${postLinks("en", en)}
`
    : ""
}
## Links

- [Full text of all posts](${SITE_URL}/llms-full.txt)
${hasEnglish ? `- [Full text of translated posts (English)](${SITE_URL}/en/llms-full.txt)\n` : ""}- [RSS Feed](${SITE_URL}/rss.xml)
${hasEnglish ? `- [RSS Feed (English)](${SITE_URL}/en/rss.xml)\n` : ""}- [GitHub](https://github.com/yujiseok)
- [Resume](${SITE_URL}${localizedPath("ko", "/resume")})
`;
};

const FULL_HEADER = {
  ko: "# Yujiseok's Blog — Full Text\n\n> 프론트엔드 개발자 유지석의 기술 블로그 전 글 원문. 최신 글이 먼저 온다.",
  en: "# Yujiseok's Blog — Full Text (English)\n\n> Posts from a frontend developer's tech blog, translated from Korean by AI. Newest first.",
} as const satisfies Record<Locale, string>;

export const buildLlmsFull = (locale: Locale, markdowns: string[]) =>
  `${FULL_HEADER[locale]}\n\n${markdowns.join("\n---\n\n")}`;
