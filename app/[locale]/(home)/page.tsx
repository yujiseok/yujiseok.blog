import Link from "next/link";
import BlurContainer from "@/app/_components/blur-container";
import HomeArtwork from "@/app/[locale]/(home)/_components/home-artwork";
import PostRow from "@/app/[locale]/(main)/_components/post-row";
import { getAllWritings } from "@/lib/content/repository";
import ArrowUpRight from "@/app/_components/arrow-up-right";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath } from "@/lib/i18n/locales";
import { requireLocale } from "@/lib/i18n/params";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await requireLocale(params);
  const { site, home } = getDictionary(locale);
  const writings = (await getAllWritings(locale)).slice(0, 5);

  return (
    // 글 칸은 다른 라우트와 같은 42rem, 그림은 24rem. 둘과 gap을 더한 69rem이
    // 이 페이지 main의 폭이라 두 칸이 딱 맞아떨어진다.
    <div className="grid gap-12 xl:grid-cols-[42rem_24rem]">
      <BlurContainer className="gap-10 self-start break-keep">
        <nav className="flex items-center gap-3 text-neutral-600 md:text-sm dark:text-neutral-400">
          <Link
            href={localizedPath(locale, "/music")}
            className="underline underline-offset-2"
          >
            Music
          </Link>
          <Link
            href={localizedPath(locale, "/resume")}
            className="underline underline-offset-2"
          >
            Resume
          </Link>
          {/* 로컬 글쓰기 도구. 프로덕션에선 /editor 자체가 404라 링크도 감춘다 */}
          {process.env.NODE_ENV === "development" && (
            <Link
              href="/editor"
              className="underline decoration-dashed underline-offset-2"
            >
              Editor
            </Link>
          )}
        </nav>

        <header>
          <h1 className="text-lg font-medium">{site.name}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Frontend Developer
          </p>
        </header>

        <div>
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
          <div className="flex justify-end">
            <Link
              href={localizedPath(locale, "/posts")}
              className="group mt-4 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <span>{home.more}</span>
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </BlurContainer>

      <HomeArtwork alt={home.artworkAlt} />
    </div>
  );
}
