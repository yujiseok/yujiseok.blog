import type { JSONContent } from "@tiptap/core";
import { toString as mdastToString } from "mdast-util-to-string";
import { markdownToDoc } from "./parse";
import { parser } from "./processor";
import { docToMarkdown } from "./serialize";

export { docToMarkdown, markdownToDoc };

interface OpenedDocument {
  doc: JSONContent;
  /**
   * 편집 후 저장해도 본문 "내용"이 보존되는지. 빈 줄·이스케이프·목록 마커
   * 간격 같은 표기 차이는 허용한다 — remark-stringify가 항상 정규화하므로
   * 바이트 동일성을 요구하면 기존 글 전부가 편집 불가가 된다.
   */
  lossless: boolean;
}

/**
 * 이 모듈의 진짜 계약은 markdownToDoc 도 docToMarkdown 도 아니고 둘의 합성이다:
 * "열었다가 저장하면 내용이 그대로여야 한다." 그 판정을 호출자가 조립하게
 * 두면 판정 규칙이 모듈 밖으로 새므로 여기서 함께 내놓는다.
 */
export function openForEditing(markdown: string): OpenedDocument {
  const doc = markdownToDoc(markdown);

  return {
    doc,
    lossless: contentOf(docToMarkdown(doc)) === contentOf(markdown),
  };
}

const contentOf = (markdown: string): string =>
  mdastToString(parser().parse(markdown)).replace(/\s+/g, " ").trim();
