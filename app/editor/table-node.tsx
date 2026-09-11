"use client";

import { ContextMenu } from "@base-ui/react/context-menu";
import type { Editor } from "@tiptap/core";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { Fragment, type MouseEvent as ReactMouseEvent } from "react";

import { cn } from "@/lib/cn";
import { BlockDeleteButton } from "./block-delete";
import { MENU_ITEM, POPUP, POSITIONER } from "./ui";

/*
 * lib/editor/markdown.ts가 왕복시키는 GFM 파이프 표. 셀의 align attr은
 * 익스텐션이 이미 "left"|"center"|"right"|null로 들고 있어(이미지·문단과 같은
 * 값 체계다) 따로 얹을 게 없다.
 *
 * 행·열 조작은 툴바가 아니라 표 위 우클릭 메뉴에 둔다. 표 안에 커서가 있을
 * 때만 쓸 수 있는 명령 일곱 개를 툴바에 늘어놓으면 나머지 시간 내내 잠긴
 * 버튼이 자리를 차지한다. 메뉴가 노드뷰 안에 있으므로 "표 안인가" 판정도
 * 필요 없다 — 오른쪽 버튼이 닿는 자리가 곧 그 표다.
 *
 * Tab/Shift-Tab 셀 이동은 익스텐션의 기본 키맵을 그대로 쓴다.
 */

// prose는 헤더를 <thead th>로 칠한다. 여기 헤더는 tbody 첫 행의 <th>라 그
// 선택자에 걸리지 않으므로 테두리·굵기만 직접 준다.
const CELL =
  "border border-neutral-200 px-3 py-1.5 align-top dark:border-neutral-800";
const HEADER_CELL = `${CELL} bg-neutral-50 font-semibold dark:bg-neutral-900`;

// 셀 안 문단이 prose의 문단 여백(my-5)을 그대로 받으면 한 줄짜리 표가 세로로
// 늘어진다.
const TABLE = "my-0 w-full border-collapse text-sm [&_p]:my-0";

interface TableAction {
  id: string;
  label: string;
  /** 표 전체를 지우는 것만 붉게 표시한다 — 한 행·열 삭제와 무게가 다르다 */
  destructive?: boolean;
  run: (editor: Editor) => void;
}

// 그룹을 데이터로 두면 구분선이 그룹 사이에 자동으로 들어간다 — 툴바의
// SECTIONS와 같은 방식이다. 표 전체를 지우는 항목만 따로 떼어 맨 아래에 둔다.
const ACTION_GROUPS: TableAction[][] = [
  [
    {
      id: "addRowBefore",
      label: "위에 행 추가",
      run: (editor) => editor.chain().focus().addRowBefore().run(),
    },
    {
      id: "addRowAfter",
      label: "아래에 행 추가",
      run: (editor) => editor.chain().focus().addRowAfter().run(),
    },
    {
      id: "deleteRow",
      label: "행 삭제",
      run: (editor) => editor.chain().focus().deleteRow().run(),
    },
  ],
  [
    {
      id: "addColumnBefore",
      label: "왼쪽에 열 추가",
      run: (editor) => editor.chain().focus().addColumnBefore().run(),
    },
    {
      id: "addColumnAfter",
      label: "오른쪽에 열 추가",
      run: (editor) => editor.chain().focus().addColumnAfter().run(),
    },
    {
      id: "deleteColumn",
      label: "열 삭제",
      run: (editor) => editor.chain().focus().deleteColumn().run(),
    },
  ],
  [
    {
      id: "deleteTable",
      label: "표 삭제",
      destructive: true,
      run: (editor) => editor.chain().focus().deleteTable().run(),
    },
  ],
];

function TableNodeView({ editor, deleteNode }: ReactNodeViewProps) {
  // 메뉴 항목은 전부 selection을 보고 도는 커맨드다. 우클릭이 캐럿을 옮기지
  // 않는 브라우저(Firefox)에서도 방금 누른 셀에 걸리도록 좌표에서 위치를 직접
  // 구해 selection을 옮겨 둔다.
  const placeCaret = (event: ReactMouseEvent) => {
    const found = editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });
    if (found) editor.commands.setTextSelection(found.pos);
  };

  return (
    <NodeViewWrapper className="group relative my-6">
      <BlockDeleteButton onDelete={deleteNode} label="표 삭제" />
      <ContextMenu.Root>
        {/* 열이 많은 표가 본문 칸을 밀고 나가지 않도록 가로 스크롤만 연다 */}
        <ContextMenu.Trigger
          className="overflow-x-auto"
          onContextMenu={placeCaret}
        >
          {/* as 는 NoInfer 라 제네릭을 명시해야 table 의 props 로 좁혀진다 */}
          <NodeViewContent<"table"> as="table" className={TABLE} />
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner className={POSITIONER}>
            <ContextMenu.Popup className={cn(POPUP, "min-w-40 p-1")}>
              {ACTION_GROUPS.map((group, index) => (
                <Fragment key={group[0].id}>
                  {index > 0 && (
                    <ContextMenu.Separator className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                  )}
                  {group.map((action) => (
                    <ContextMenu.Item
                      key={action.id}
                      onClick={() => action.run(editor)}
                      className={cn(
                        MENU_ITEM,
                        action.destructive && "text-red-600 dark:text-red-400",
                      )}
                    >
                      {action.label}
                    </ContextMenu.Item>
                  ))}
                </Fragment>
              ))}
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </NodeViewWrapper>
  );
}

// 셀 스키마를 문단 하나로 좁힌다. 기본값(block+)이면 목록·코드블록이 셀에
// 들어갈 수 있는데, GFM 셀은 블록을 담지 못해 저장할 때 조용히 사라진다.
const CELL_CONTENT = "paragraph";

export const TableNodes = [
  Table.extend({
    addNodeView() {
      return ReactNodeViewRenderer(TableNodeView, {
        // 노드뷰의 실제 contentDOM은 NodeViewContent 안에 한 겹 더 만들어진다.
        // 기본값(div)을 두면 <table><div><tr>이 되어 표가 무너진다.
        contentDOMElementTag: "tbody",
      });
    },
  }),
  TableRow,
  TableHeader.extend({ content: CELL_CONTENT }).configure({
    HTMLAttributes: { class: HEADER_CELL },
  }),
  TableCell.extend({ content: CELL_CONTENT }).configure({
    HTMLAttributes: { class: CELL },
  }),
];
