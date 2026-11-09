import { notFound } from "next/navigation";

import { isLocale, type Locale } from "./locales";

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
