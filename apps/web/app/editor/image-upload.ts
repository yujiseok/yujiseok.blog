import { errorMessage } from "@/lib/error-message";
import type { Editor } from "@tiptap/core";

import { isValidSlug } from "@/lib/content/document";
import { reportEditorError } from "./toast";

// app/editor/upload/route.ts의 화이트리스트와 짝이다. 여기서 막는 건 편의일 뿐,
// 실제 방어는 서버가 한다.
const ACCEPT =
  "image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml";

/**
 * 슬래시 커맨드의 이미지 항목은 ProseMirror 플러그인 안에서 실행돼 React prop이
 * 닿지 않는다. 에디터가 화면에 하나뿐인 로컬 도구라, 툴바가 받은 slug를 모듈
 * 스코프 한 곳에 두고 두 진입점이 같은 값을 보게 한다.
 */
const uploadSlug: { current: string | null } = { current: null };

export const setUploadSlug = (slug: string | null) => {
  uploadSlug.current = slug;
};

/**
 * 숨은 input[type=file]을 그때그때 만들어 띄운다. 취소로 창을 닫으면 change가
 * 오지 않으므로 cancel도 같이 듣는다 — 안 그러면 Promise가 영영 안 풀려
 * 버튼이 잠긴 채로 남는다.
 */
const pickImageFile = (): Promise<File | null> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPT;
    input.addEventListener("change", () => resolve(input.files?.[0] ?? null), {
      once: true,
    });
    input.addEventListener("cancel", () => resolve(null), { once: true });
    input.click();
  });

/** 서버 응답도 신뢰 경계 밖이다. 기대한 모양이 아니면 문자열로 취급하지 않는다 */
const readString = (payload: unknown, key: string): string | null => {
  if (typeof payload !== "object" || payload === null) return null;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
};

interface ImageSize {
  width: number;
  height: number;
}

/**
 * next/image가 width/height를 요구하는데, 그 값을 얻자고 서버에 이미지 디코더를
 * 들일 이유는 없다. 브라우저는 어차피 이 파일을 화면에 그릴 참이라 원본 크기를
 * 공짜로 알려 준다. createImageBitmap은 objectURL을 만들지 않아 되돌릴 것도
 * 없고, 대신 비트맵을 직접 닫아 메모리를 돌려준다.
 *
 * 내재 크기가 없는 SVG나 손상된 파일은 여기서 null이 된다 — 크기를 모르는 건
 * 업로드를 막을 이유가 아니다. 호출부가 width/height 없이 그대로 삽입한다.
 */
const readImageSize = async (file: File): Promise<ImageSize | null> => {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    return width > 0 && height > 0 ? { width, height } : null;
  } catch {
    return null;
  }
};

const uploadImage = async (file: File, slug: string): Promise<string> => {
  const body = new FormData();
  body.append("slug", slug);
  body.append("file", file);

  const response = await fetch("/editor/upload", { method: "POST", body });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      readString(payload, "message") ??
        `이미지를 올리지 못했습니다. (${response.status})`,
    );
  }

  const src = readString(payload, "src");
  if (!src) {
    throw new Error("서버가 이미지 경로를 돌려주지 않았습니다.");
  }

  return src;
};

/**
 * 파일 선택 → 업로드 → 삽입. 툴바 버튼과 슬래시 커맨드가 같은 절차를 쓰도록
 * 한곳에 둔다. 던지지 않고 안에서 알린다 — 호출부는 Promise가 끝나는 시점만
 * 알면 되고, 그동안 버튼을 잠그는 데 쓴다.
 */
export async function insertImageByUpload(editor: Editor): Promise<void> {
  const slug = uploadSlug.current;
  // 저장 경로가 /images/<slug>/ 라 슬러그 없이는 어디에 둘지 정할 수 없다.
  // 여기서 슬러그를 되묻지 않고 상단 입력으로 돌려보낸다.
  if (!slug || !isValidSlug(slug)) {
    reportEditorError("이미지를 올리려면 슬러그를 먼저 정하세요.");
    return;
  }

  const file = await pickImageFile();
  if (!file) return; // 취소

  try {
    // 크기 읽기와 업로드는 서로를 기다릴 이유가 없다. 둘 다 같은 파일만 본다.
    const [size, src] = await Promise.all([
      readImageSize(file),
      uploadImage(file, slug),
    ]);
    // alt는 여기서 짓지 않는다. "screenshot-2026" 같은 파일명은 이미지 설명이
    // 아니라 파일 이름이고, 그게 alt로 들어가면 스크린리더가 그대로 읽는다.
    // 비워 두면 노드뷰(image-node.tsx)가 채우라고 표시한다.
    // 모르는 값은 attr에 넣지 않는다 — width/height의 기본값이 이미 null이고,
    // 없는 크기를 0이나 문자열로 채우면 저장 쪽이 그걸 진짜 크기로 읽는다.
    editor
      .chain()
      .focus()
      .setImage({ src, ...(size ?? {}) })
      .run();
  } catch (error) {
    reportEditorError(errorMessage(error, "이미지를 올리지 못했습니다."));
  }
}
