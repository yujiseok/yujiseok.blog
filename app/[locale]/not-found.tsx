import Link from "next/link";
import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";

import BlurContainer from "@/app/_components/blur-container";
import PostRow from "@/app/[locale]/(main)/_components/post-row";
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
        className="mx-auto mt-24 mb-16 w-full max-w-2xl sm:mt-28"
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
            <ul>
              {writings.map(({ metadata, slug }) => (
                <PostRow
                  key={slug}
                  metadata={metadata}
                  slug={slug}
                  locale={locale}
                />
              ))}
            </ul>
          </div>
        </BlurContainer>
      </main>
    </>
  );
}
