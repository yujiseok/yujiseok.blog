import "@/app/globals.css";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import type { Metadata } from "next";

import { geistSans } from "@/app/_fonts";

// 로컬 글쓰기 도구. app/[locale] 밖의 별도 루트 레이아웃이라 언어 접두사도 번역도
// 없다 — 한국어 고정이다. 분석 스크립트·부드러운 스크롤도 싣지 않는다.
export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} antialiased`}>
      <body className="mx-2 flex flex-col bg-transparent px-4 text-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
