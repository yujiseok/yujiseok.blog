/*
 * Figma의 「Resume KO」「Resume EN」 페이지에 있는 A4 프레임(Resume Sync 플러그인이 그림)을
 * PDF로 받아 언어별로 한 파일로 합친다. 결과는 public/resume.pdf, public/resume.en.pdf.
 *
 * 필요한 것: .env의 FIGMA_TOKEN (Figma 설정 → Security → Personal access tokens,
 * 권한은 File content 읽기 전용이면 된다).
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { PDFDocument } from "pdf-lib";

import { resumePdfPath } from "@/app/[locale]/resume/resolve";
import type { Locale } from "@/lib/i18n/locales";

const FILE_KEY = "z5aQWxNpFJ0QFDm0l2hC7g";
const A4_WIDTH = 595.28;
const LOCALES: Locale[] = ["ko", "en"];

type Node = { id: string; name: string; children?: Node[] };

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error(
    "FIGMA_TOKEN이 없습니다. Figma 설정 → Security → Personal access tokens에서 " +
      "File content 읽기 권한으로 만든 토큰을 .env에 FIGMA_TOKEN=... 으로 넣어 주세요.",
  );
  process.exit(1);
}

const figma = async <T>(path: string): Promise<T> => {
  const response = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { "X-Figma-Token": token },
  });
  if (!response.ok) {
    throw new Error(
      `Figma API ${path} → ${response.status} ${await response.text()}`,
    );
  }
  return response.json() as Promise<T>;
};

/* "KO 1/2" 같은 이름의 프레임을 쪽 순서대로 */
const pageFrames = (file: { document: Node }, locale: Locale) => {
  const label = locale.toUpperCase();
  const page = file.document.children?.find(
    (p) => p.name === `Resume ${label}`,
  );
  const pattern = new RegExp(`^${label} (\\d+)/\\d+$`);

  return (page?.children ?? [])
    .map((node) => ({ node, index: Number(node.name.match(pattern)?.[1]) }))
    .filter(({ index }) => Number.isInteger(index) && index > 0)
    .sort((a, b) => a.index - b.index)
    .map(({ node }) => node);
};

const file = await figma<{ document: Node }>(`/files/${FILE_KEY}?depth=2`);

for (const locale of LOCALES) {
  const frames = pageFrames(file, locale);
  if (frames.length === 0) {
    console.error(
      `「Resume ${locale.toUpperCase()}」 페이지에 프레임이 없습니다. Figma에서 Resume Sync 플러그인을 먼저 실행해 주세요.`,
    );
    process.exit(1);
  }

  const { images } = await figma<{ images: Record<string, string | null> }>(
    `/images/${FILE_KEY}?ids=${frames.map((f) => f.id).join(",")}&format=pdf`,
  );

  const merged = await PDFDocument.create();
  for (const frame of frames) {
    const url = images[frame.id];
    if (!url) throw new Error(`${frame.name}을 PDF로 내보내지 못했습니다`);
    const source = await PDFDocument.load(
      await (await fetch(url)).arrayBuffer(),
    );
    // copyPages는 링크(주석)를 살린다. Figma는 1px을 1pt로 내보내므로 A4로 줄인다.
    for (const page of await merged.copyPages(
      source,
      source.getPageIndices(),
    )) {
      const factor = A4_WIDTH / page.getWidth();
      page.scale(factor, factor);
      merged.addPage(page);
    }
  }

  merged.setTitle(locale === "ko" ? "유지석 이력서" : "Yu Jiseok Resume");
  const out = join(process.cwd(), "public", resumePdfPath(locale));
  await writeFile(out, await merged.save());
  console.log(`${out} (${frames.length}쪽)`);
}
