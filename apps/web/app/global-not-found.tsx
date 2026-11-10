import "@/app/globals.css";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import type { Metadata } from "next";

import { geistSans } from "@/app/_fonts";

export const metadata: Metadata = { title: "404" };

/*
 * 접두사(/ko, /en) 바깥에서 아무 라우트에도 닿지 못한 주소(예: 없는 이미지 경로)만
 * 여기로 온다. 언어를 알 수 없으므로 두 언어를 함께 적는다. /ko/없는-주소 는
 * app/[locale]/[...rest]가 받아 언어별 404를 그린다.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="mx-auto mt-24 flex w-full max-w-2xl flex-col gap-2 px-4 text-black dark:text-white">
        <h1 className="text-lg font-semibold">404</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Page not found. / 페이지를 찾을 수 없습니다.
        </p>
        <nav className="flex gap-4 text-sm underline underline-offset-2">
          <a href="/ko">한국어</a>
          <a href="/en">English</a>
        </nav>
      </body>
    </html>
  );
}
