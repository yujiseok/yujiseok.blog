import path from "node:path";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

/*
 * 번역 파일명 규칙의 단일 출처. 원문은 `slug.mdx`(ko), 번역은 `slug.en.mdx`.
 * 번역 스크립트와 에디터 액션이 repository.ts의 동적 MDX import를 끌어오지
 * 않도록 무거운 의존성 없이 이 파일에만 둔다.
 */
export const LOCALE_SUFFIX = { ko: "", en: ".en" } as const satisfies Record<
  Locale,
  string
>;

/** 원문 경로(`…/slug.mdx`)에 대응하는 번역본 경로(`…/slug.en.mdx`). */
export const toTranslationPath = (sourcePath: string) =>
  sourcePath.replace(/\.mdx$/, `${LOCALE_SUFFIX.en}.mdx`);

/** 디렉터리 파일명에서 해당 언어의 글만 골라 slug(언어 접미사 제외)와 묶는다. */
export const listLocaleFiles = (files: string[], locale: Locale) =>
  files.flatMap((file) => {
    if (path.extname(file) !== ".mdx") return [];

    const name = path.basename(file, ".mdx");
    const isTranslation = name.endsWith(LOCALE_SUFFIX.en);
    const slug = isTranslation ? name.slice(0, -LOCALE_SUFFIX.en.length) : name;

    // 번역본은 기본 언어가 아닌 쪽의 파일이다
    return isTranslation === (locale !== DEFAULT_LOCALE) ? [{ file, slug }] : [];
  });
