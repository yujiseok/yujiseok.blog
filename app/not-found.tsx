import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto mt-24 flex w-full max-w-2xl flex-col gap-2 sm:mt-28">
      <h1 className="text-lg font-semibold">404</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        페이지를 찾을 수 없습니다.
      </p>
      <Link href="/" className="w-fit text-sm underline underline-offset-2">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
