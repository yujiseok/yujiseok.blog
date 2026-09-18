"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import ExternalLink from "@/app/_components/external-link";
import type { GalleryImage } from "@/lib/gallery";

/*
 * <dialog>로 띄운다. ESC 닫기, 포커스 가두기, 뒤 배경 비활성은 브라우저가
 * 이미 하는 일이라 직접 만들면 손해다. 여기서 더하는 건 좌우 이동뿐이다.
 */
const ImageViewer = ({
  image,
  position,
  total,
  onClose,
  onMove,
}: {
  image: GalleryImage | null;
  /** 걸러 낸 목록에서 몇 번째인지. 표시용이다 */
  position: number;
  total: number;
  onClose: () => void;
  onMove: (step: number) => void;
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (!image) dialog.close();
    else if (!dialog.open) dialog.showModal();
  }, [image]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // 백드롭은 dialog 자신이 그리므로, 이미지 바깥을 누르면 target이 여기다
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onMove(-1);
        if (event.key === "ArrowRight") onMove(1);
      }}
      className="h-dvh max-h-none w-screen max-w-none bg-transparent outline-none backdrop:bg-white/95 dark:backdrop:bg-black/95 [&_button]:outline-none"
    >
      {image && (
        <div className="relative flex h-full w-full flex-col">
          <div className="relative min-h-0 flex-1 p-4 sm:p-10">
            <Image
              src={image.src}
              alt={image.artist.name}
              fill
              sizes="100vw"
              quality={95}
              priority
              className="object-contain"
            />
          </div>

          <footer className="flex items-center justify-between gap-4 px-4 pb-4 text-sm text-neutral-600 sm:px-10 dark:text-neutral-400">
            <span>
              {image.artist.url ? (
                <ExternalLink
                  href={image.artist.url}
                  className="underline underline-offset-2"
                >
                  {image.artist.name}
                </ExternalLink>
              ) : (
                image.artist.name
              )}
              {image.title && (
                <span className="ml-2 text-neutral-500 dark:text-neutral-500">
                  {image.title}
                </span>
              )}
              {image.year && (
                <span className="ml-2 text-neutral-400 dark:text-neutral-600">
                  {image.year}
                </span>
              )}
              <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-600">
                {position + 1} / {total}
              </span>
            </span>

            <span className="flex gap-4">
              <button
                type="button"
                onClick={() => onMove(-1)}
                aria-label="이전"
              >
                ←
              </button>
              <button type="button" onClick={() => onMove(1)} aria-label="다음">
                →
              </button>
              <button type="button" onClick={onClose} aria-label="닫기">
                ✕
              </button>
            </span>
          </footer>
        </div>
      )}
    </dialog>
  );
};

export default ImageViewer;
