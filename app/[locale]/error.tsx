"use client";

import { PAGE_BOTTOM, PAGE_TOP } from "@/app/_components/page-spacing";
import { useLocaleContext } from "@/app/_components/locale-provider";

export default function Error({ reset }: { reset: () => void }) {
  // 에러 경계는 [locale] 레이아웃 안쪽이라 Provider 아래에 있다
  const { error } = useLocaleContext();

  return (
    <main
      className={`mx-auto flex w-full max-w-2xl flex-col gap-2 ${PAGE_TOP} ${PAGE_BOTTOM}`}
    >
      <h1 className="text-lg font-semibold">{error.title}</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        {error.description}
      </p>
      <button onClick={reset} className="w-fit text-sm underline">
        {error.retry}
      </button>
    </main>
  );
}
