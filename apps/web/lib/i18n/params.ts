import { notFound } from "next/navigation";

import { isLocale, type Locale } from "./locales";

/** `[locale]` 세그먼트만 가진 라우트의 props. slug 같은 값이 더 있는 라우트는 자기 타입을 둔다. */
export type LocaleParams = { params: Promise<{ locale: string }> };

/** 라우트 `[locale]` 파라미터를 Locale로 좁힌다. 지원하지 않는 값이면 404다. */
export const requireLocale = async (
  params: Promise<{ locale: string }>,
): Promise<Locale> => {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return locale;
};
