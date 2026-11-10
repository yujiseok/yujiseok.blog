import { StrokeIcon } from "./icons";
import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";

import { insertImageByUpload } from "./image-upload";

/*
 * "블록을 새로 끼워 넣는" 명령의 단일 목록. 툴바의 삽입 그룹과 슬래시 메뉴가
 * 여기서 파생되므로 항목 하나를 늘릴 때 두 파일을 고칠 일이 없고, 같은 명령이
 * 두 진입점에서 다른 이름으로 보이는 일도 없다.
 *
 * 링크는 여기 없다 — URL을 받아야 해서 명령 하나로 끝나지 않고 툴바에서
 * 팝오버를 여는 항목이다. 슬래시 메뉴에 넣을 방법도 없다.
 */

interface InsertBlock {
  id: string;
  /** 툴바 버튼의 라벨이자 슬래시 메뉴의 제목 */
  label: string;
  /** 슬래시 메뉴 검색어. 툴바는 쓰지 않는다 */
  keywords: string[];
  /** 툴바 아이콘. 슬래시 메뉴는 글자만 쓴다 */
  icon: ReactNode;
  /**
   * 업로드처럼 시간이 걸리는 명령은 Promise를 돌려준다. 반환 타입이 unknown인
   * 건 대부분의 명령이 chain().run()의 boolean을 그대로 흘려보내기 때문이다.
   */
  run: (editor: Editor) => unknown;
}

export const INSERT_BLOCKS: InsertBlock[] = [
  {
    id: "horizontalRule",
    label: "구분선",
    keywords: ["divider", "hr", "구분선"],
    icon: "—",
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "image",
    label: "이미지",
    keywords: ["image", "img", "이미지"],
    icon: <ImageIcon />,
    run: insertImageByUpload,
  },
  {
    id: "table",
    label: "표",
    keywords: ["table", "표", "grid"],
    icon: <TableIcon />,
    // 첫 행이 헤더인 3×3. GFM 표는 헤더 행이 없으면 문법 자체가 성립하지 않는다.
    // 행·열 조작은 표 위 우클릭 메뉴에 있다.
    run: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: "details",
    label: "접기",
    keywords: ["details", "toggle", "접기", "펼침"],
    icon: <DetailsIcon />,
    run: (editor) => editor.chain().focus().setDetails().run(),
  },
];

function TableIcon() {
  return (
    <StrokeIcon>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="20" />
    </StrokeIcon>
  );
}

function ImageIcon() {
  return (
    <StrokeIcon>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </StrokeIcon>
  );
}

function DetailsIcon() {
  return (
    <StrokeIcon>
      <polyline points="5 6 9 9 5 12" />
      <line x1="13" y1="9" x2="20" y2="9" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </StrokeIcon>
  );
}
