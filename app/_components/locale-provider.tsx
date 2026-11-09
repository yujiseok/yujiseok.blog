"use client";

import { createContext, use } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

/*
 * 글 본문(MDX)은 컴파일된 모듈이라 페이지가 props를 내려줄 길이 없고, error.tsx는
 * props로 언어를 받지 못한다. 그 둘(본문 링크·코드블록·에러 화면)만 이 컨텍스트로 받는다. 언어는 레이아웃 단위로
 * 고정이라 바뀌지 않는다.
 */
interface LocaleContextValue {
  locale: Locale;
  codeBlock: Dictionary["codeBlock"];
  error: Dictionary["error"];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const LocaleProvider = ({
  locale,
  codeBlock,
  error,
  children,
}: LocaleContextValue & { children: React.ReactNode }) => (
  <LocaleContext value={{ locale, codeBlock, error }}>{children}</LocaleContext>
);

export const useLocaleContext = (): LocaleContextValue => {
  const value = use(LocaleContext);

  if (!value) {
    throw new Error("LocaleProvider 밖에서 호출했습니다");
  }

  return value;
};
