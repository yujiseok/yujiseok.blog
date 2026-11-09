"use client";

import Image from "next/image";

import type { GalleryImage } from "@/lib/gallery";

/*
 * 벽은 CSS 다단(columns)으로 쌓으므로 항목마다 자기 비율만큼 높이를 갖는다 —
 * 정사각으로 자르지 않는다. 비율을 style로 미리 박아 두면 이미지가 도착하기 전에
 * 자리가 잡혀 레이아웃이 흔들리지 않는다(정적 import가 아니라 blur 플레이스홀더는
 * 여전히 못 쓴다). 치수를 못 읽은 파일만 정사각으로 세운다.
 */
const GalleryItem = ({
  image: { src, artist, width, height },
  viewLabel,
  onOpen,
}: {
  image: GalleryImage;
  /** `{artist}` 자리표시자가 든 템플릿 */
  viewLabel: string;
  onOpen: () => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={viewLabel.replace("{artist}", artist.name)}
    style={{ aspectRatio: width && height ? width / height : 1 }}
    className="group relative mb-2 block w-full break-inside-avoid overflow-hidden bg-neutral-100 dark:bg-neutral-900"
  >
    <Image
      src={src}
      alt={artist.name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
      quality={90}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
    {/* 좁은 화면에는 호버가 없으므로 이름을 늘 띄워 둔다 */}
    <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 text-left text-xs text-white transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
      {artist.name}
    </span>
  </button>
);

export default GalleryItem;
