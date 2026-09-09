"use client";

import { Toast } from "@base-ui/react/toast";
import Link from "next/link";

/**
 * 저장 결과를 알리는 토스트. 성공하면 방금 쓴 글로 바로 갈 수 있어야 해서
 * slug를 같이 실어 보낸다. 실패는 눈으로 놓치면 글을 잃은 줄 모르므로
 * 자동으로 사라지지 않는다(useSaveToast의 timeout 참고).
 */
interface SaveToastData {
  slug?: string;
}

const slugOf = (data: unknown): string | null =>
  typeof data === "object" && data !== null && "slug" in data
    ? ((data as SaveToastData).slug ?? null)
    : null;

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
        // 0이면 직접 닫을 때까지 남는다. 저장 실패는 놓치면 안 되는 소식이다.
        timeout: 0,
      }),
  };
}

export function EditorToastViewport() {
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
        className="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg data-ending-style:opacity-0 data-starting-style:opacity-0 dark:border-neutral-800 dark:bg-neutral-900"
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
