import type { Editor } from "@tiptap/core";

import { isValidSlug } from "@/lib/editor/document";
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

/** 실패를 사용자에게 알리는 유일한 지점. 툴바와 슬래시 커맨드가 같이 쓴다. */
const reportFailure = reportEditorError;

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
    reportFailure("이미지를 올리려면 슬러그를 먼저 정하세요.");
    return;
  }

  const file = await pickImageFile();
  if (!file) return; // 취소

  try {
    const src = await uploadImage(file, slug);
    editor.chain().focus().setImage({ src }).run();
  } catch (error) {
    reportFailure(
      error instanceof Error ? error.message : "이미지를 올리지 못했습니다.",
    );
  }
}
