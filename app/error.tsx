"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto mt-24 flex w-full max-w-2xl flex-col gap-2 sm:mt-28">
      <h1 className="text-lg font-semibold">문제가 발생했습니다</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        페이지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button onClick={reset} className="w-fit text-sm underline">
        다시 시도
      </button>
    </main>
  );
}
