import type { JSONContent } from "@tiptap/core";
import type { Table } from "mdast";
import { toAlign } from "../../align-value";
import type { ToMdast, ToTiptap } from "./recurse";

// ----------------------------------------------------------------------------
// 표
// GFM 파이프 표 <-> table > tableRow > (tableHeader|tableCell) > paragraph.
// 정렬은 mdast 에서 열 단위(table.align) 한 벌이지만 Tiptap 스키마에는 열을 담을
// 노드가 없다. 셀마다 같은 값을 실어 두고, 되돌릴 때 헤더 행에서 다시 읽는다 —
// 값 체계는 이미지·문단과 같은 "left"|"center"|"right"|null 이다.
// ----------------------------------------------------------------------------

// 빈 셀도 문단 하나는 있어야 스키마를 만족한다. 내용이 없을 때 content 키를
// 비워 두는 건 Tiptap 의 getJSON 이 내놓는 모양과 맞추기 위해서다.
const cellParagraph = (content: JSONContent[]): JSONContent =>
  content.length === 0 ? { type: "paragraph" } : { type: "paragraph", content };

export function convertTableToTiptap(
  node: Table,
  source: string,
  to: ToTiptap,
): JSONContent {
  const align = node.align ?? [];

  return {
    type: "table",
    content: node.children.map((row, rowIndex) => ({
      type: "tableRow",
      content: row.children.map((cell, columnIndex) => ({
        // GFM 표의 첫 행은 언제나 헤더다. 구분선 없이 본문만 있는 표는 문법상
        // 존재하지 않으므로 행 번호만으로 판정할 수 있다.
        type: rowIndex === 0 ? "tableHeader" : "tableCell",
        attrs: { align: align[columnIndex] ?? null },
        content: [cellParagraph(to.inline(cell.children, [], source))],
      })),
    })),
  };
}

export function tableToMdast(node: JSONContent, to: ToMdast): Table {
  const rows = node.content ?? [];

  return {
    type: "table",
    // 열 정렬은 구분선 한 줄에만 실린다. 행마다 다른 값이 들어 있어도 쓸 수
    // 있는 건 하나뿐이라 헤더 행을 그 열의 대표값으로 삼는다.
    align: (rows[0]?.content ?? []).map((cell) => toAlign(cell.attrs?.align)),
    children: rows.map((row) => ({
      type: "tableRow",
      children: (row.content ?? []).map((cell) => ({
        type: "tableCell",
        // GFM 셀에는 블록을 담을 수 없다. 셀 안 문단들의 인라인만 이어 붙인다.
        children: (cell.content ?? []).flatMap((block) =>
          to.inline(block.content ?? []),
        ),
      })),
    })),
  };
}
