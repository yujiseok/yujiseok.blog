"use client";

import { Toast } from "@base-ui/react/toast";
import Link from "next/link";
import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { POPUP } from "./ui";

/**
 * 저장 결과를 알리는 토스트. 성공하면 방금 쓴 글로 바로 갈 수 있어야 해서
 * slug를 같이 실어 보낸다.
 */
interface SaveToastData {
  slug?: string;
}

// 에러는 성공보다 오래 보여 주되 반드시 사라진다. 무한으로 두면 같은 실패를
// 반복할 때 화면이 토스트로 덮인다.
const ERROR_TIMEOUT = 8000;

const slugOf = (data: unknown): string | null =>
  typeof data === "object" && data !== null && "slug" in data
    ? ((data as SaveToastData).slug ?? null)
    : null;

/**
 * 훅을 쓸 수 없는 자리(ProseMirror 플러그인, 업로드 유틸)에서도 실패를 알려야
 * 한다. Provider 안에서 싱크를 등록해 두고 그쪽에서 부른다 — 에디터가 화면에
 * 하나뿐인 로컬 도구라 이 정도 seam이 가장 싸다.
 */
let sink: ((message: string) => void) | null = null;

export const reportEditorError = (message: string) => {
  if (sink) {
    sink(message);
    return;
  }
  // Provider가 아직 안 붙었을 때 조용히 삼키면 원인을 알 수 없다.
  console.error(message);
};

export function useSaveToast() {
  const manager = Toast.useToastManager();

  return {
    saved: (slug: string) =>
      manager.add({
        title: "저장했습니다",
        description: `content/writing/${slug}.mdx`,
        data: { slug } satisfies SaveToastData,
      }),
    failed: (message: string) =>
      manager.add({
        title: "저장하지 못했습니다",
        description: message,
        type: "error",
        // 저장 실패는 성공보다 오래 남기지만, 무한히 두면 화면을 덮는다.
        timeout: ERROR_TIMEOUT,
      }),
  };
}

export function EditorToastViewport() {
  const manager = Toast.useToastManager();

  useEffect(() => {
    sink = (message) =>
      manager.add({
        title: "문제가 생겼습니다",
        description: message,
        type: "error",
        timeout: ERROR_TIMEOUT,
      });
    return () => {
      sink = null;
    };
  }, [manager]);

  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed right-4 bottom-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        <ToastList />
      </Toast.Viewport>
    </Toast.Portal>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => {
    const slug = slugOf(toast.data);

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          POPUP,
          "p-3 data-ending-style:opacity-0 data-starting-style:opacity-0",
        )}
      >
        <Toast.Content className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Toast.Title
              className={
                toast.type === "error"
                  ? "text-sm font-medium text-red-600 dark:text-red-400"
                  : "text-sm font-medium"
              }
            />
            <Toast.Description className="truncate text-xs text-neutral-500 dark:text-neutral-400" />
            {slug && (
              <Toast.Action
                className="mt-1 w-fit text-xs underline decoration-dashed underline-offset-2"
                render={<Link href={`/writing/${slug}`} />}
              >
                글 보러 가기
              </Toast.Action>
            )}
          </div>
          <Toast.Close
            aria-label="닫기"
            className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            <CloseIcon />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
