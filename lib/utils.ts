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

const parseFrontmatter = (mdxContent: string) => {
  const frontmatterRegEx = /---\s*([\s\S]*?)\s*---/;
  const matchedFrontMatter = frontmatterRegEx.exec(mdxContent)?.at(1) as string;
  const content = mdxContent.replace(frontmatterRegEx, "").trim();
  const frontMatterLines = matchedFrontMatter?.trim().split("\n");

  const metadata = frontMatterLines.reduce((acc, line) => {
    const [key, value] = line.split(":").map((str) => str.trim());
    return { ...acc, [key]: value.replaceAll('"', "") };
  }, {} as Metadata);

  return { metadata, content };
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

  return parseFrontmatter(mdxContent);
};

const getAllContent = (contentType: ContentType) => {
  const mdxFiles = getMdxFiles(contentType);

  return mdxFiles
    .map((file) => {
      const { metadata, content } = readMdxFile(contentType, file);
      const slug = path.basename(file, ".mdx");
      return { metadata, content, slug };
    })
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime(),
    );
};

export const getAllWritings = () => getAllContent("writing");
export const getAllAtelier = () => getAllContent("atelier");
