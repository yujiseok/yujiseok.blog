import type { JSONContent } from "@tiptap/core";
import type { PhrasingContent, RootContent as MdastNode } from "mdast";

import type { TiptapMark } from "../marks";
import type { MdastBlock } from "../serialize";

/*
 * 접기 블록·표·정렬 div 는 안쪽 내용을 다시 변환해야 한다. 노드 모듈이 parse/serialize
 * 를 직접 import 하면 서로 물고 물려 로드 순서에 따라 TDZ 로 깨질 수 있어서, 재귀에 쓸
 * 변환기는 호출하는 쪽이 인자로 넘긴다. 이 파일은 타입만 둔다.
 */
export interface ToTiptap {
  block: (node: MdastNode, source: string) => JSONContent;
  blocks: (children: MdastNode[], source: string) => JSONContent[];
  inline: (
    children: MdastNode[],
    marks: TiptapMark[],
    source: string,
  ) => JSONContent[];
}

export interface ToMdast {
  block: (node: JSONContent) => MdastBlock;
  inline: (content: JSONContent[]) => PhrasingContent[];
}
