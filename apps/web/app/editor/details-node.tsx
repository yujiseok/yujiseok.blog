"use client";

import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";

import { cn } from "@/lib/cn";
import { BlockDeleteButton } from "./block-delete";
import { CaretDownIcon } from "./icons";
import { ICON_BUTTON, SURFACE, UNPRESSED } from "./ui";

/*
 * lib/editor/markdown.ts가 왕복시키는 <details> 접기 블록. 세 노드가 한 벌이다:
 * details > (detailsSummary, detailsContent).
 *
 * 공식 익스텐션을 쓰는 이유는 스키마보다 키보드 동작 때문이다 — 요약에서
 * Enter를 누르면 본문으로 내려가고, 빈 요약에서 Backspace를 누르면 접기가
 * 풀리는(unsetDetails) 처리가 이미 들어 있다. 직접 짜면 그 구조 보정만
 * ProseMirror 코드 200줄이 된다.
 *
 * 노드뷰만 갈아 끼운다. 기본 노드뷰는 CSS 클래스(is-open)와 hidden 속성을
 * 직접 토글해 app/globals.css에 스타일이 있어야 하고, 열림 상태를 DOM
 * 이벤트로 자식에게 전파한다. 여기서는 열림이 곧 open attr이므로 그 사본을
 * DOM에 따로 둘 이유가 없다.
 */

// 접힌 상태에서는 본문만 감춘다. 자식 선택자를 못 쓰는 이유는 노드뷰의 실제
// contentDOM이 NodeViewContent 안에 한 겹 더 만들어지기 때문이다(table-node.tsx
// 참고). 본문 노드가 스스로 붙이는 data-type으로 찾는다.
const COLLAPSED = "[&_[data-type=detailsContent]]:hidden";

function DetailsView({
  node,
  updateAttributes,
  deleteNode,
}: ReactNodeViewProps) {
  const open = node.attrs.open === true;

  return (
    <NodeViewWrapper
      className={cn(
        SURFACE,
        "group relative my-4 flex gap-1 bg-neutral-50 p-2 dark:bg-neutral-900",
      )}
    >
      <BlockDeleteButton onDelete={deleteNode} label="접기 블록 삭제" />
      <button
        type="button"
        contentEditable={false}
        aria-expanded={open}
        aria-label={open ? "접기" : "펼치기"}
        // 툴바 버튼과 같은 이유로 mousedown을 막는다 — 여기서 에디터가
        // blur되면 토글 한 번에 커서 자리를 잃는다.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => updateAttributes({ open: !open })}
        className={cn(ICON_BUTTON, UNPRESSED, "mt-0.5")}
      >
        <CaretDownIcon
          className={cn("transition-transform", !open && "-rotate-90")}
        />
      </button>
      {/* 요약과 본문이 한 contentDOM 안에 나란히 있다. 요약은 <summary>라
          글로벌 스타일이 이미 한 줄로 눕혀 준다. */}
      <NodeViewContent
        className={cn(
          "min-w-0 flex-1 [&_summary]:font-medium",
          !open && COLLAPSED,
        )}
      />
    </NodeViewWrapper>
  );
}

export const DetailsNodes = [
  // persist: true 라야 open이 문서의 attr로 남는다. 기본값(false)이면 스키마에
  // attr 자체가 없어 <details open>을 저장할 수 없다.
  Details.configure({ persist: true }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(DetailsView);
    },
  }),
  DetailsSummary,
  // 기본 노드뷰는 본문에 hidden 속성을 걸고 부모가 쏘는 DOM 이벤트로만
  // 벗긴다. 부모 노드뷰를 갈아 끼운 이상 그 이벤트가 오지 않아 본문이 영영
  // 감춰지므로, 노드뷰 없이 renderHTML 결과 그대로 두고 여닫기는 위에서 한다.
  DetailsContent.extend({ addNodeView: null }),
];
