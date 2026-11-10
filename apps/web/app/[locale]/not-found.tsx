import {
  PAGE_BOTTOM,
  PAGE_TOP,
  PAGE_WIDTH,
} from "@/app/_components/page-spacing";
import Link from "next/link";
import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";

import BlurContainer from "@/app/_components/blur-container";
import PostList from "@/app/[locale]/_components/post-list";
import { getAllWritings } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "404" };

// not-found는 props를 받지 못한다. [locale]이 루트 파라미터라 next/root-params로 읽는다.
// 이 파일은 app/[locale]/(main)/layout.tsx를 타지 않으므로 main의 여백을 직접 맞춘다.
export default async function NotFound() {
  const raw = await rootLocale();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const { notFound } = getDictionary(locale);
  const writings = (await getAllWritings(locale)).slice(0, 5);

  return (
    <>
      <main
        id="content"
        className={`mx-auto w-full ${PAGE_WIDTH.default} ${PAGE_TOP} ${PAGE_BOTTOM}`}
      >
        <BlurContainer className="gap-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold">404</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {notFound.description}
            </p>
            <Link
              href={localizedPath(locale, "/")}
              className="w-fit text-sm underline underline-offset-2"
            >
              {notFound.home}
            </Link>
          </header>

          <div>
            <h2 className="text-sm text-neutral-500 dark:text-neutral-400">
              {notFound.recent}
            </h2>
            <PostList writings={writings} locale={locale} />
          </div>
        </BlurContainer>
      </main>
    </>
  );
}
