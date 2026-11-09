import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import GalleryWall from "@/app/[locale]/gallery/_components/gallery-wall";
import { SITE_URL } from "@/lib/constants";
import { getGallery, shuffle } from "@/lib/gallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale } from "@/lib/i18n/params";
import { localizedPath } from "@/lib/i18n/locales";
import { alternates, siteOg } from "@/lib/metadata";

type GalleryParams = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({
  params,
}: GalleryParams): Promise<Metadata> => {
  const locale = await requireLocale(params);
  const description = getDictionary(locale).gallery.description;

  return {
    title: "Gallery",
    description,
    alternates: alternates(locale, "/gallery"),
    openGraph: {
      title: "Gallery",
      description,
      url: `${SITE_URL}${localizedPath(locale, "/gallery")}`,
      type: "website",
      ...siteOg(locale),
    },
  };
};

/*
 * 접근할 때마다 벽의 배치가 달라져야 한다. 순서를 빌드 타임에 정하면 프리렌더된
 * HTML에 배치가 박히므로 connection()으로 요청 시점까지 미루고, 그래서 이 라우트는
 * 요청 때 그리는 블로킹 라우트가 된다 — cacheComponents는 그걸 instant로 명시하게
 * 한다(app/editor/page.tsx와 같은 이유). 디렉터리를 읽는 값비싼 쪽은 getGallery의
 * "use cache"가 그대로 쥐고, 섞는 일만 캐시 밖에서 한다.
 */
export const instant = false;

/*
 * (main) 그룹 밖에 둔 라우트다. 그 레이아웃의 max-w-2xl 안에서는 이미지가
 * 너무 작아 벽으로 보이지 않는다. 설명도 푸터도 없이 이미지만 세운다.
 */
const page = async ({ params }: GalleryParams) => {
  await connection();
  const locale = await requireLocale(params);
  const { artists, all, viewArtwork, previous, next, close, artistNames } =
    getDictionary(locale).gallery;
  // 작가 표기는 언어별이다. 사전에 없는 폴더(한국어 포함)는 원래 이름을 쓴다.
  const images = shuffle(await getGallery()).map((image) => ({
    ...image,
    artist: {
      ...image.artist,
      name: artistNames[image.folder] ?? image.artist.name,
    },
  }));

  return (
    <main id="content" className="w-full p-2 pt-10 sm:pt-14">
      {/* 화면에서는 이미지가 전부다. 제목은 문서 구조로만 남긴다 */}
      <h1 className="sr-only">Gallery</h1>

      {/* 주소를 읽는 쪽(useSearchParams)은 Suspense 안에 있어야 한다. 예전에는
          fallback에 벽 전체를 담아 뒀는데, 요청 시점 렌더가 된 뒤로는 같은 벽이
          응답에 두 번 실려 HTML이 그대로 두 배가 된다(측정: 1.1MB, 항목 514개).
          같은 응답 안에서 곧 채워지므로 비워 둔다. */}
      <Suspense fallback={null}>
        <GalleryWall
          locale={locale}
          labels={{ artists, all, viewArtwork, previous, next, close }}
          images={images}
        />
      </Suspense>
    </main>
  );
};
export default page;
