import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

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

const getAllContent = async (contentType: ContentType) => {
  const files = await fs.readdir(path.join(ROOT_DIR, contentType));

  const contents = await Promise.all(
    files
      .filter((file) => path.extname(file) === ".mdx")
      .map(async (file) => {
        const slug = path.basename(file, ".mdx");
        const { metadata } = await importMdx(contentType, slug);

        return { metadata, slug };
      }),
  );

  return contents.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );
};

export const getAllWritings = () => getAllContent("writing");

export const getWritingBySlug = async (slug: string) =>
  (await getAllWritings()).find((writing) => writing.slug === slug);

export const getAllAtelier = () => getAllContent("atelier");

export const getAtelierBySlug = async (slug: string) =>
  (await getAllAtelier()).find((atelier) => atelier.slug === slug);
