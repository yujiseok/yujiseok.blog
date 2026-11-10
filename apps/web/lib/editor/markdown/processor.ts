import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import type { Literal as MdastLiteral } from "mdast";

/**
 * 원문을 이스케이프 없이 그대로 뱉기 위한 커스텀 mdast 노드.
 * mdast 타입에 등록해 두면 트리를 만드는 쪽과 remark-stringify 핸들러 쪽이
 * 같은 타입을 쓴다.
 */
export interface MdxRaw extends MdastLiteral {
  type: "mdxRaw";
}

declare module "mdast" {
  interface RootContentMap {
    mdxRaw: MdxRaw;
  }
  interface BlockContentMap {
    mdxRaw: MdxRaw;
  }
  interface PhrasingContentMap {
    mdxRaw: MdxRaw;
  }
}

export function parser() {
  return unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
}

// 표를 쓸 때 remark-gfm 의 기본값은 셀을 열 너비에 맞춰 공백으로 채운다. 그
// 너비를 문자 개수로 재기 때문에 한글 표에서는 오히려 어긋나 보인다. 파이프만
// 최소로 찍는다 — 렌더 결과는 같다.
const GFM_WRITE_OPTIONS = { tablePipeAlign: false };

export function stringifier() {
  return unified()
    .use(remarkStringify, {
      bullet: "-",
      emphasis: "_",
      strong: "*",
      rule: "-",
      fence: "`",
      handlers: {
        // mdxRaw: 원문 그대로 보존해야 하는 노드. 이스케이프 없이 출력한다.
        mdxRaw: (node: MdxRaw) => node.value,
        // 기본값은 줄 끝 백슬래시지만 이 저장소의 기존 글은 전부 공백 두 칸을
        // 쓴다. 의미는 같아도 표기가 달라지면 왕복이 깨진다.
        break: () => "  \n",
      },
    })
    .use(remarkGfm, GFM_WRITE_OPTIONS)
    .use(remarkMdx);
}
