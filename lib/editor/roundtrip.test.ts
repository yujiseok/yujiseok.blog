import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { parsePost } from "@/lib/content/document";
import { docToMarkdown, markdownToDoc, openForEditing } from "./markdown";

// 에디터의 진짜 인수 기준: 이미 쓴 글을 에디터로 열었다가 그대로 저장했을 때
// 본문 내용이 보존되어야 한다. 빈 줄·이스케이프 같은 표기 차이는 허용한다 —
// remark-stringify가 항상 정규화하므로 바이트 동일성은 달성 불가능한 목표다.
const files = ["writing", "atelier"].flatMap((type) => {
  const dir = path.join(process.cwd(), "content", type);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file));
});

describe("기존 글을 열었다 저장해도 내용이 보존된다", () => {
  it.each(files)("%s", (file) => {
    const { body } = parsePost(fs.readFileSync(file, "utf8"));

    expect(openForEditing(body).lossless).toBe(true);
  });
});

/*
 * 위가 "이미 쓴 글"의 보존이라면, 이쪽은 에디터에서 직접 친 JSX다. mdxBlock의
 * textarea에 넣은 원문이 파일에 그대로 가야 한다 — 여기가 깨지면 사용자가 쓴
 * 컴포넌트가 저장하는 순간 사라진다.
 */
describe("에디터에서 친 MDX 블록", () => {
  const source = "<Callout>\n  직접 친 JSX\n</Callout>";

  it("원문 그대로 파일에 쓰인다", () => {
    const doc = {
      type: "doc",
      content: [{ type: "mdxBlock", attrs: { value: source } }],
    };

    expect(docToMarkdown(doc)).toContain(source);
  });

  it("저장한 뒤 다시 열어도 같은 원문이다", () => {
    expect(docToMarkdown(markdownToDoc(source)).trim()).toBe(source);
  });
});
