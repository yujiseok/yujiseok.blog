import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

import { parsePost } from "./editor/document";

type ContentType = "writing" | "atelier";

export interface Metadata {
  title: string;
  summary: string;
  publishedAt: string;
  image?: string;
}

interface MdxModule {
  default: ComponentType;
  metadata: Metadata;
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
 * 24개 글을 전부 읽을 때마다 그 비용을 치를 이유가 없다. lib/toc.ts와 같은
 * 방식으로 원문만 읽어 metadata export만 떼어낸다.
 */
export const readAllContent = async (contentType: ContentType) => {
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

  return contents.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );
};

const getAllContent = async (contentType: ContentType) => {
  "use cache";

  return readAllContent(contentType);
};

export const getAllWritings = () => getAllContent("writing");

export const getWritingBySlug = async (slug: string) =>
  (await getAllWritings()).find((writing) => writing.slug === slug);

export const getAllAtelier = () => getAllContent("atelier");

export const getAtelierBySlug = async (slug: string) =>
  (await getAllAtelier()).find((atelier) => atelier.slug === slug);
