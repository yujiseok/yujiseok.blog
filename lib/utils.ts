import fs from "fs";
import path from "path";

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

const getMdxFiles = () =>
  fs.readdirSync(ROOT_DIR).filter((file) => path.extname(file) === ".mdx");

const readMdxFile = (filePath: string) => {
  const mdxContent = fs.readFileSync(filePath, "utf8");

  return parseFrontmatter(mdxContent);
};

export const getAllWritings = () => {
  const mdxFiles = getMdxFiles();

  return mdxFiles
    .map((file) => {
      const { metadata, content } = readMdxFile(path.join(ROOT_DIR, file));
      const slug = path.basename(file, ".mdx");
      return { metadata, content, slug };
    })
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime(),
    );
};
