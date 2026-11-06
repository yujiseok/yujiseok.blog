import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

import { SITE_URL } from "@/lib/constants";

import { isPublished, parsePost, type PostMetadata } from "./document";
import { toMarkdown } from "./markdown";

type ContentType = "writing" | "atelier";

interface MdxModule {
  default: ComponentType;
  metadata: PostMetadata;
}

const ROOT_DIR = path.join(process.cwd(), "content");

// 템플릿 리터럴의 앞부분이 정적이어야 번들러가 모듈을 찾을 수 있어 분기한다
export const importMdx = (
  contentType: ContentType,
  slug: string,
): Promise<MdxModule> =>
  contentType === "writing"
    ? import(`@/content/writing/${slug}.mdx`)
    : import(`@/content/atelier/${slug}.mdx`);

/*
 * 목록 페이지·RSS·sitemap·llms.txt는 메타데이터만 있으면 된다. importMdx로
 * 모듈을 평가하면 컴파일된 shiki HTML까지 포함한 본문 전체가 딸려 온다 —
 * 24개 글을 전부 읽을 때마다 그 비용을 치를 이유가 없다. lib/content/toc.ts와 같은
 * 방식으로 원문만 읽어 metadata export만 떼어낸다.
 */
export const readAllContent = async (
  contentType: ContentType,
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
) => {
  const files = await fs.readdir(path.join(ROOT_DIR, contentType));

  const contents = await Promise.all(
    files
      .filter((file) => path.extname(file) === ".mdx")
      .map(async (file) => {
        const slug = path.basename(file, ".mdx");
        const source = await fs.readFile(
          path.join(ROOT_DIR, contentType, file),
          "utf8",
        );

        return { metadata: parsePost(source).metadata, slug };
      }),
  );

  return contents
    .filter(({ metadata }) => includeDrafts || isPublished(metadata))
    .sort(
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

const getAllContent = async (contentType: ContentType) => {
  "use cache";

  return readAllContent(contentType, { includeDrafts: INCLUDE_DRAFTS });
};

export const getAllWritings = () => getAllContent("writing");

export const getWritingBySlug = async (slug: string) =>
  (await getAllWritings()).find((writing) => writing.slug === slug);

/*
 * 에이전트용 마크다운 원문(/posts/<slug>.md, /llms-full.txt). 목록에 있는 slug만
 * 읽으므로 초안 필터와 slug 검증을 getAllWritings에 그대로 맡긴다.
 */
export const getWritingMarkdown = async (slug: string) => {
  const writing = await getWritingBySlug(slug);

  if (!writing) {
    return;
  }

  const source = await fs.readFile(
    path.join(ROOT_DIR, "writing", `${writing.slug}.mdx`),
    "utf8",
  );

  return toMarkdown({
    ...writing.metadata,
    url: `${SITE_URL}/posts/${writing.slug}`,
    body: parsePost(source).body,
  });
};

export const getAllAtelier = () => getAllContent("atelier");

export const getAtelierBySlug = async (slug: string) =>
  (await getAllAtelier()).find((atelier) => atelier.slug === slug);
