"use client";

import { Image } from "@tiptap/extension-image";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/cn";
import { toAlign, type Align } from "./align";

/*
 * 기본 Image 익스텐션은 src/alt/title만 다루고 크기·정렬은 손댈 수 없다.
 * lib/editor/markdown.ts가 왕복시키는 attrs 계약 — width/height는 픽셀 "숫자",
 * align은 null이 곧 가운데 — 을 그대로 두고 그 값을 편집할 수 있는 노드뷰만
 * 얹는다. 직렬화가 모르는 attr을 추가하면 저장 때 원문이 깎이므로 여기 있는
 * attr 이름과 타입은 markdown.ts와 짝이다.
 *
 * setImage 커맨드·parseHTML·입력 규칙은 부모 것을 그대로 물려받는다 —
 * image-upload.ts와 슬래시 커맨드가 setImage를 부른다.
 *
 * 정렬 UI는 여기 없다. 이미지든 문단이든 툴바의 정렬 버튼 하나로 건다 —
 * 정렬 컨트롤이 두 군데 있으면 어느 쪽이 지금 값인지 알 수 없다.
 * 판정과 적용은 app/editor/align.ts에 있다.
 */

// 이보다 좁아지면 크기 조절 핸들 둘이 맞닿아 무엇을 줄이는지 안 보인다.
const MIN_WIDTH = 80;
// 키보드 한 걸음. 드래그와 달리 연속값이 아니라 눈에 띄는 단위여야 한다.
const KEY_STEP = 16;

/**
 * width/height는 next/image가 요구하는 픽셀 숫자다. HTML에서 파싱하면 문자열로
 * 들어오는데, 문자열이 attrs에 남으면 숫자를 기대하는 직렬화와 어긋난다.
 */
const toPixels = (value: unknown): number | null => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) && parsed > 0
    ? Math.round(parsed)
    : null;
};

const pixelAttribute = (name: "width" | "height") => ({
  default: null,
  parseHTML: (element: HTMLElement) => toPixels(element.getAttribute(name)),
  renderHTML: (attributes: Record<string, unknown>) => {
    const value = toPixels(attributes[name]);
    return value === null ? {} : { [name]: value };
  },
});

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: pixelAttribute("width"),
      height: pixelAttribute("height"),
      align: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          toAlign(element.getAttribute("data-align")),
        // 기본값(null)은 아무 것도 적지 않는다 — 가운데는 렌더의 기본이라
        // "center"를 굳이 남기면 원문에 없던 표시가 생긴다.
        renderHTML: (attributes: Record<string, unknown>) => {
          const align = toAlign(attributes.align);
          return align === null ? {} : { "data-align": align };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

interface ImageAttrs {
  src: string;
  alt: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  align: Align | null;
}

// node.attrs는 스키마가 타입을 보장하지 않는 Record<string, any>다. 노드뷰
// 안에서 매번 확인하지 않도록 한 번만 좁힌다.
const readAttrs = (attrs: Record<string, unknown>): ImageAttrs => ({
  src: typeof attrs.src === "string" ? attrs.src : "",
  alt: typeof attrs.alt === "string" ? attrs.alt : null,
  title: typeof attrs.title === "string" ? attrs.title : null,
  width: toPixels(attrs.width),
  height: toPixels(attrs.height),
  align: toAlign(attrs.align),
});

const ALIGN_CLASS: Record<Align, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

interface ResizeHandle {
  id: string;
  label: string;
  className: string;
  /** 오른쪽 핸들은 커서를 오른쪽으로 끌수록 넓어지고, 왼쪽 핸들은 반대다. */
  direction: 1 | -1;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  {
    id: "left",
    label: "왼쪽에서 너비 조절",
    className: "left-1.5",
    direction: -1,
  },
  {
    id: "right",
    label: "오른쪽에서 너비 조절",
    className: "right-1.5",
    direction: 1,
  },
];

// 화살표 키가 미는 방향. 핸들의 direction과 곱하면 "핸들을 그쪽으로 민다"가 된다.
const ARROW_STEPS = [
  { key: "ArrowLeft", step: -1 },
  { key: "ArrowRight", step: 1 },
];

interface DragState {
  pointerId: number;
  startX: number;
  startWidth: number;
  /** 드래그를 시작한 시점의 본문 칸 너비. 중간에 다시 재지 않는다. */
  available: number;
  direction: 1 | -1;
}

const clampWidth = (width: number, available: number) =>
  Math.round(
    Math.min(Math.max(width, MIN_WIDTH), Math.max(available, MIN_WIDTH)),
  );

// 드래그 좌표는 "시작 너비 + 이동량 × 방향"이라는 순서가 곧 의미다. 배열
// 메서드로 감싸면 흐름만 가려져 여기만 계산식 그대로 둔다.
const widthAt = (drag: DragState, clientX: number) =>
  clampWidth(
    drag.startWidth + (clientX - drag.startX) * drag.direction,
    drag.available,
  );

function ImageNodeView({
  node,
  updateAttributes,
  selected,
  ref,
}: ReactNodeViewProps) {
  const attrs = readAttrs(node.attrs);
  const dragRef = useRef<DragState | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);

  // 크기 조절은 원본 비율을 아는 이미지에서만 연다. 내재 크기가 없어 width가
  // 비어 들어온 이미지(SVG 등)는 비율을 지킬 근거가 없으니, 없는 값을 지어내는
  // 대신 핸들을 감춘다 — 정렬은 그대로 쓸 수 있다.
  const ratio =
    attrs.width !== null && attrs.height !== null
      ? attrs.height / attrs.width
      : null;

  // 노드뷰 래퍼는 본문 칸을 꽉 채우는 블록이라 그 폭이 곧 최대 너비다.
  const availableWidth = () => ref.current?.clientWidth ?? 0;

  const commitWidth = (width: number) => {
    if (ratio === null) return;
    const next = clampWidth(width, availableWidth());
    updateAttributes({ width: next, height: Math.round(next * ratio) });
  };

  const startResize = (
    event: ReactPointerEvent<HTMLButtonElement>,
    handle: ResizeHandle,
  ) => {
    if (attrs.width === null || ratio === null) return;

    // 브라우저 기본 이미지 드래그와 ProseMirror의 선택 변경을 함께 막는다.
    event.preventDefault();
    // 포인터 캡처를 잡아 두면 커서가 이미지 밖으로 나가도 move/up이 이 버튼에
    // 계속 온다 — window 리스너를 달고 정리할 필요가 없다.
    event.currentTarget.setPointerCapture(event.pointerId);

    const available = availableWidth();
    const startWidth = clampWidth(attrs.width, available);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth,
      available,
      direction: handle.direction,
    };
    setPreviewWidth(startWidth);
  };

  const moveResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    // 드래그 중에는 트랜잭션을 하나도 만들지 않는다. 매 프레임 커밋하면 한 번
    // 끈 결과가 undo 수백 번으로 쌓인다. 프리뷰는 이 컴포넌트 상태로만 움직인다.
    setPreviewWidth(widthAt(drag, event.clientX));
  };

  const endResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setPreviewWidth(null);
    // 히스토리에 남는 건 이 한 번뿐이다.
    commitWidth(widthAt(drag, event.clientX));
  };

  // 포인터가 취소되면(제스처 가로채기 등) 프리뷰만 되돌리고 attrs는 건드리지
  // 않는다. pointerup 뒤에도 불리지만 그때는 이미 비어 있어 아무 일도 없다.
  const cancelResize = () => {
    dragRef.current = null;
    setPreviewWidth(null);
  };

  const resizeByKey = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    handle: ResizeHandle,
  ) => {
    const arrow = ARROW_STEPS.find(({ key }) => key === event.key);
    if (!arrow || attrs.width === null) return;
    event.preventDefault();
    commitWidth(
      clampWidth(attrs.width, availableWidth()) +
        arrow.step * KEY_STEP * handle.direction,
    );
  };

  const displayWidth = previewWidth ?? attrs.width;
  const align = attrs.align ?? "center";

  return (
    <NodeViewWrapper ref={ref} className={cn("my-6 flex", ALIGN_CLASS[align])}>
      {/* 이미지 노드에는 편집 가능한 내용이 없다. 툴바·핸들이 ProseMirror의
          편집 영역으로 취급되지 않도록 통째로 닫는다. */}
      <div
        className="relative inline-block max-w-full leading-none"
        contentEditable={false}
      >
        {/* next/image는 빌드 타임에 아는 경로를 최적화한다. 여기 src는 방금
            업로드한 파일이고 이 화면은 로컬 전용 에디터라 그냥 img를 쓴다.
            발행된 글은 mdx-components.tsx가 next/image로 그린다. */}
        <img
          src={attrs.src}
          alt={attrs.alt ?? ""}
          title={attrs.title ?? undefined}
          width={attrs.width ?? undefined}
          height={attrs.height ?? undefined}
          draggable={false}
          // 원본이 본문 칸보다 크면 표시만 칸에 맞춰 줄인다(attr은 원본 그대로).
          style={displayWidth === null ? undefined : { width: displayWidth }}
          className={cn(
            "m-0 h-auto max-w-full rounded-md",
            selected &&
              "outline-2 outline-offset-2 outline-black dark:outline-white",
          )}
        />

        {selected &&
          ratio !== null &&
          RESIZE_HANDLES.map((handle) => (
            <button
              key={handle.id}
              type="button"
              aria-label={handle.label}
              onPointerDown={(event) => startResize(event, handle)}
              onPointerMove={moveResize}
              onPointerUp={endResize}
              onPointerCancel={cancelResize}
              onLostPointerCapture={cancelResize}
              onKeyDown={(event) => resizeByKey(event, handle)}
              className={cn(handleClass, handle.className)}
            />
          ))}
      </div>
    </NodeViewWrapper>
  );
}

// touch-none이 없으면 터치 드래그가 스크롤로 새어 나가 크기 조절이 끊긴다.
const handleClass =
  "absolute top-1/2 h-12 w-1.5 -translate-y-1/2 cursor-ew-resize touch-none rounded-full bg-neutral-900/80 ring-1 ring-white/70 transition-colors hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white";
