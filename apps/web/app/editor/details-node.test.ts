import { describe, expect, it } from "vitest";
import { getSchema } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";

import { markdownToDoc } from "@/lib/editor/markdown";
import { DetailsNodes } from "./details-node";

/*
 * markdown.ts가 만드는 details JSON과 에디터 스키마는 서로를 모른 채 맞물린다.
 * 모양이 어긋나도 setContent는 조용히 노드를 버리기만 해서, 글을 열어보기
 * 전까지 아무도 모른다. 실제 스키마로 파싱해 검사한다.
 */
const schema = getSchema([
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  ...DetailsNodes,
]);

const parse = (markdown: string) =>
  ProseMirrorNode.fromJSON(schema, markdownToDoc(markdown));

describe("details 노드 - 스키마 계약", () => {
  const md = [
    "<details open>",
    "  <summary>제목</summary>",
    "",
    "  본문",
    "</details>",
    "",
  ].join("\n");

  it("markdownToDoc 결과가 에디터 스키마를 통과하고 open attr 이 살아 있다", () => {
    const doc = parse(md);

    expect(() => doc.check()).not.toThrow();
    expect(doc.firstChild?.type.name).toBe("details");
    // persist 없이는 open 이 조용히 사라진다
    expect(doc.firstChild?.attrs).toEqual({ open: true });
  });

  it("스키마를 거쳐도 JSON이 바뀌지 않는다", () => {
    expect(parse(md).toJSON()).toEqual(markdownToDoc(md));
  });
});
