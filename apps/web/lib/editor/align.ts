import { Extension, type Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { toAlign, type Align } from "./align-value";

/*
 * 정렬은 이미지와 문단 양쪽에 붙지만 "값이 없다(null)"의 뜻이 서로 다르다.
 *
 *   - 이미지: null = 가운데. 노드뷰도 발행된 글도 가운데가 렌더 기본이라
 *     "center"를 굳이 적으면 원문에 없던 표시가 생긴다.
 *   - 문단·제목: null = 왼쪽. 블록 요소의 렌더 기본이 왼쪽이라 여기선
 *     "left"를 적을 이유가 없다.
 *
 * 그래서 툴바에서 같은 "가운데" 버튼을 눌러도 이미지에는 null을, 문단에는
 * "center"를 써야 한다. 이 비대칭을 아는 곳을 이 파일 하나로 묶는다 —
 * 호출부마다 알고 있으면 한쪽만 고쳐 조용히 어긋난다.
 *
 * @tiptap/extension-text-align을 쓰지 않는 이유: attr 이름이 textAlign이고
 * 기본값이 "left" 문자열이라 lib/editor/markdown의 왕복 계약(null이 곧
 * 기본값)과 어긋나고, 자체 키맵까지 달아 온다.
 */

interface AlignOption {
  value: Align;
  label: string;
}

export const ALIGN_OPTIONS: AlignOption[] = [
  { value: "left", label: "왼쪽 정렬" },
  { value: "center", label: "가운데 정렬" },
  { value: "right", label: "오른쪽 정렬" },
];

/** 정렬을 적용할 대상. null이면 지금 자리에는 정렬을 걸 수 없다. */
export type AlignTarget = "image" | "block";

interface AlignState {
  target: AlignTarget | null;
  /** target이 null이면 의미 없는 값이다. 표시할 때 target을 먼저 본다. */
  align: Align;
}

// 정렬을 얹을 수 있는 블록. 코드블록·mdxBlock·표는 <div>로 감싸면 저장 형식이
// 깨지거나 뜻이 달라져 제외한다.
const ALIGNABLE_TYPES = ["paragraph", "heading"];

/**
 * 커서가 놓인 최상위 문단·제목. depth 1이 아니면(목록·인용·표 안) null이다 —
 * 그 안에서 정렬을 걸면 저장 때 `- <div ...>`가 되어 마크다운이 깨진다.
 */
function alignableAt(state: EditorState): ProseMirrorNode | null {
  const { $from } = state.selection;
  if ($from.depth !== 1) return null;

  const node = $from.parent;
  return ALIGNABLE_TYPES.includes(node.type.name) ? node : null;
}

export function readAlign(editor: Editor): AlignState {
  if (editor.isActive("image")) {
    return {
      target: "image",
      align: toAlign(editor.getAttributes("image").align) ?? "center",
    };
  }

  const node = alignableAt(editor.state);
  if (!node) return { target: null, align: "left" };

  return { target: "block", align: toAlign(node.attrs.align) ?? "left" };
}

/**
 * 툴바의 정렬 버튼 하나가 부르는 유일한 진입점. 대상이 이미지냐 블록이냐에
 * 따라 "기본값으로 되돌리기"가 어느 값인지 갈린다.
 */
export function applyAlign(editor: Editor, align: Align): boolean {
  const { target } = readAlign(editor);

  switch (target) {
    case "image":
      return editor
        .chain()
        .focus()
        .updateAttributes("image", { align: align === "center" ? null : align })
        .run();
    case "block":
      return editor
        .chain()
        .focus()
        .setBlockAlign(align === "left" ? null : align)
        .run();
    case null:
      return false;
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockAlign: {
      /** 커서가 놓인 최상위 문단·제목의 정렬을 바꾼다. null이면 기본(왼쪽). */
      setBlockAlign: (align: Align | null) => ReturnType;
    };
  }
}

/**
 * paragraph/heading에 align attr 하나만 얹는다. lib/editor/markdown이
 * 이 attr을 <div style={{ textAlign }}>로 왕복시키므로 이름과 값 체계가 짝이다.
 */
export const BlockAlign = Extension.create({
  name: "blockAlign",

  addGlobalAttributes() {
    return [
      {
        types: ALIGNABLE_TYPES,
        attributes: {
          align: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              toAlign(element.style.textAlign),
            // 기본값(null=왼쪽)은 아무 것도 적지 않는다.
            renderHTML: (attributes: Record<string, unknown>) => {
              const align = toAlign(attributes.align);
              return align === null ? {} : { style: `text-align: ${align}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBlockAlign:
        (align) =>
        ({ state, commands }) => {
          const node = alignableAt(state);
          if (!node) return false;

          return commands.updateAttributes(node.type.name, { align });
        },
    };
  },
});
