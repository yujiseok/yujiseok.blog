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
 * mdxBlock은 에디터가 모르는 JSX를 원문 그대로 들고 있다가 저장할 때 되돌려
 * 놓는 역할만 한다. 여기가 깨지면 <Callout> 같은 컴포넌트가 든 글을 에디터로
 * 열었다 저장하는 것만으로 사라진다.
 */
describe("MDX 블록은 원문을 잃지 않는다", () => {
  const source = "<Callout>\n  직접 친 JSX\n</Callout>";

  it("저장하면 원문 그대로 파일에 쓰인다", () => {
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
