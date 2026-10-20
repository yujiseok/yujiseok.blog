import fs from "node:fs/promises";
import path from "node:path";

import { readImageSize } from "@/lib/image-size";

import {
  buildGalleryImage,
  compareGallerySrc,
  isGalleryFile,
  type GalleryImage,
} from "./gallery";

/*
 * 테스트가 임시 디렉터리를 넘긴다. 이 파일은 앱 라우트가 import하지 않는다.
 * 여기서 경로를 인자로 읽으면 프로덕션 함수가 public/images 전체를 추적한다.
 */
export const readGallery = async (dir: string): Promise<GalleryImage[]> => {
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);

  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const images = await Promise.all(
    folders.map(async (folder) => {
      const files = await fs.readdir(path.join(dir, folder)).catch(() => []);

      return Promise.all(
        files
          .filter(isGalleryFile)
          .map(async (file) =>
            buildGalleryImage(
              folder,
              file,
              await readImageSize(path.join(dir, folder, file)),
            ),
          ),
      );
    }),
  );

  return images.flat().sort(compareGallerySrc);
};
