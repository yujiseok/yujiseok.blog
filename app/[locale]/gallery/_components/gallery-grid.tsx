"use client";

import GalleryItem from "@/app/[locale]/gallery/_components/gallery-item";
import ImageViewer from "@/app/[locale]/gallery/_components/image-viewer";
import { cn } from "@/lib/cn";
import type { GalleryImage } from "@/lib/gallery";
import { imageKey } from "@/lib/gallery-key";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

/** 클라이언트 경계를 넘으므로 함수 없이 문자열만 받는다 */
export type GalleryLabels = Pick<
  Dictionary["gallery"],
  "artists" | "all" | "viewArtwork" | "previous" | "next" | "close"
>;

/*
 * 고른 작가를 밖에서 받는다. URL을 읽는 쪽(gallery-wall)은 Suspense 안에
 * 있어야 해서, 프리렌더되는 껍데기는 이 컴포넌트를 "전체" 상태로 그린다.
 */
const GalleryGrid = ({
  locale,
  labels,
  images,
  selected,
  viewing,
  onSelect,
  onView,
}: {
  locale: Locale;
  labels: GalleryLabels;
  images: GalleryImage[];
  selected: string | null;
  /** 열어 둔 그림의 파일 경로. 자리 번호로 두면 섞일 때마다 다른 그림이 열린다 */
  viewing?: string | null;
  /** 프리렌더되는 껍데기에는 없다 — 하이드레이션 전에는 누를 수도 없다 */
  onSelect?: (folder: string | null) => void;
  onView?: (key: string | null) => void;
}) => {
  // 사이드바 목록은 벽에 실제로 걸린 것에서만 나온다 — 빈 작가는 뜨지 않는다
  // 작가 객체는 언어별 이름을 입히며 이미지마다 새로 만들어지므로 폴더로 묶는다
  const artists = [...new Map(images.map((i) => [i.folder, i.artist]))]
    .map(([folder, artist]) => ({
      artist,
      folder,
      count: images.filter((i) => i.folder === folder).length,
    }))
    .sort((a, b) => a.artist.name.localeCompare(b.artist.name, locale));

  const shown = selected
    ? images.filter((image) => image.folder === selected)
    : images;

  const tabs = [
    { folder: null, name: labels.all, count: images.length },
    ...artists.map(({ folder, artist, count }) => ({
      folder,
      name: artist.name,
      count,
    })),
  ];

  // 필터가 바뀌어 목록에서 사라진 그림을 가리키고 있으면 뷰어는 닫힌다
  const position = viewing
    ? shown.findIndex((image) => imageKey(image) === viewing)
    : -1;

  const move = (step: number) => {
    if (position < 0) return;
    const next = shown[(position + step + shown.length) % shown.length];
    onView?.(imageKey(next));
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <nav
        aria-label={labels.artists}
        className="flex shrink-0 gap-3 overflow-x-auto text-sm whitespace-nowrap md:sticky md:top-6 md:w-36 md:flex-col md:gap-1.5 md:self-start md:overflow-visible"
      >
        {tabs.map(({ folder, name, count }) => (
          <button
            key={folder ?? "all"}
            type="button"
            onClick={() => onSelect?.(folder)}
            className={cn(
              "text-left transition-colors",
              selected === folder
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300",
            )}
          >
            {name}
            <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-600">
              {count}
            </span>
          </button>
        ))}
      </nav>

      {/*
       * 격자가 아니라 CSS 다단이다. 그림마다 비율이 다르므로 같은 높이로 줄을
       * 맞추면 전부 잘라야 한다 — 다단이면 각자 제 높이로 흐르고 빈틈이 메워진다.
       * 네이티브 masonry(grid-lanes)는 2026년 9월 기준 Safari만 정식이라 아직
       * 폴백이 필요한데, 폴백이 곧 이 다단이므로 처음부터 다단으로 간다.
       * 대신 DOM 순서가 열 단위로 흐르지만, 배치가 매번 랜덤이라 읽는 순서에
       * 의미가 없어 잃는 것이 없다.
       */}
      <section className="flex-1 columns-2 gap-2 sm:columns-3 md:columns-4 xl:columns-5">
        {shown.map((image) => (
          <GalleryItem
            key={image.src}
            image={image}
            viewLabel={labels.viewArtwork}
            onOpen={() => onView?.(imageKey(image))}
          />
        ))}
      </section>

      <ImageViewer
        image={position >= 0 ? shown[position] : null}
        position={position}
        total={shown.length}
        labels={labels}
        onClose={() => onView?.(null)}
        onMove={move}
      />
    </div>
  );
};

export default GalleryGrid;
