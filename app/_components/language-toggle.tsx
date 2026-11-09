"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  languageTogglePath,
  localeCookie,
  LOCALES,
  type Locale,
} from "@/lib/i18n/locales";

/*
 * 같은 경로의 다른 언어로 간다. 번역이 없는 글에서는 404 대신 en 글 목록으로 보낸다
 * (translated는 번역이 있는 slug들).
 *
 * 누를 때만 선택을 쿠키로 남긴다. 드물게 누르는 링크라 모든 페이지에서 미리 받지
 * 않는다.
 */
export const LanguageToggle = ({
  locale,
  translated,
  labels,
}: {
  locale: Locale;
  translated: readonly string[];
  labels: Dictionary["languageToggle"];
}) => {
  const pathname = usePathname();
  const translatedSet = new Set(translated);

  return (
    <nav
      aria-label={labels.label}
      className="absolute top-3 right-6 z-40 flex gap-3 text-xs text-neutral-500 dark:text-neutral-400 print:hidden"
    >
      {LOCALES.map((target) =>
        target === locale ? (
          <span
            key={target}
            lang={target}
            aria-current="true"
            className="text-black dark:text-white"
          >
            {labels[target]}
          </span>
        ) : (
          <Link
            key={target}
            href={languageTogglePath(pathname, target, translatedSet)}
            hrefLang={target}
            lang={target}
            prefetch={false}
            onClick={() => {
              document.cookie = localeCookie(target);
            }}
            className="underline-offset-2 hover:text-black hover:underline dark:hover:text-white"
          >
            {labels[target]}
          </Link>
        ),
      )}
    </nav>
  );
};
