import fs from "fs";
import path from "path";

type ContentType = "writing" | "atelier";

export interface Metadata {
  title: string;
  summary: string;
  publishedAt: string;
  image?: string;
}

const MDX_CONTENT_DIR = "content";
const ROOT_DIR = path.join(process.cwd(), MDX_CONTENT_DIR);

const parseMetadataExport = (mdxContent: string) => {
  const metadataRegEx =
    /export\s+const\s+metadata\s*=\s*(\{[\s\S]*?\n\})/;
  const match = metadataRegEx.exec(mdxContent);

  if (!match) {
    return { metadata: {} as Metadata };
  }

  const metadata = JSON.parse(match[1]) as Metadata;
  return { metadata };
};

const getMdxFiles = (contentType: ContentType) => {
  const contentPath = path.join(ROOT_DIR, contentType);
  return fs
    .readdirSync(contentPath)
    .filter((file) => path.extname(file) === ".mdx");
};

const readMdxFile = (contentType: ContentType, fileName: string) => {
  const filePath = path.join(ROOT_DIR, contentType, fileName);
  const mdxContent = fs.readFileSync(filePath, "utf8");

  return parseMetadataExport(mdxContent);
};

const getAllContent = (contentType: ContentType) => {
  const mdxFiles = getMdxFiles(contentType);

  return mdxFiles
    .map((file) => {
      const { metadata } = readMdxFile(contentType, file);
      const slug = path.basename(file, ".mdx");
      return { metadata, slug };
    })
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime(),
    );
};

export const getAllWritings = () => getAllContent("writing");

export const getWritingBySlug = (slug: string) => {
  const writings = getAllWritings();
  return writings.find((writing) => writing.slug === slug);
};

export const getAllAtelier = () => getAllContent("atelier");
