import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { readGallery } from "./gallery-read";
import { ARTISTS, shuffle } from "./gallery";
import { imageKey } from "./gallery-key";

/*
 * "use cache"는 vitest 환경에서 동작하지 않으므로 캐시 래퍼(getGallery)가
 * 아니라 실제로 디렉터리를 읽는 순수 함수를 검증한다.
 * lib/content/repository.test.ts와 같은 이유다.
 */
describe("readGallery", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "gallery-"));

    const write = async (file: string) => {
      await fs.mkdir(path.join(dir, path.dirname(file)), { recursive: true });
      await fs.writeFile(path.join(dir, file), "");
    };

    await write("park-seo-bo/2026-01-01.jpg");
    await write("park-seo-bo/2026-01-02.PNG");
    await write("park-seo-bo/.DS_Store");
    await write("park-seo-bo/notes.txt");
    await write("daily_paintings/2026-02-01.webp");
    await write("yujiseok/2026-03-01.avif");
    await write("empty-folder/.gitkeep");
    await fs.writeFile(path.join(dir, "loose.jpg"), "");
  });

  afterAll(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("이미지 확장자만, 대소문자와 무관하게 수집한다", async () => {
    const images = await readGallery(dir);

    expect(images.map((image) => image.src).sort()).toEqual([
      "/images/gallery/daily_paintings/2026-02-01.webp",
      "/images/gallery/park-seo-bo/2026-01-01.jpg",
      "/images/gallery/park-seo-bo/2026-01-02.PNG",
      "/images/gallery/yujiseok/2026-03-01.avif",
    ]);
  });

  it("폴더 바로 아래 흩어진 파일과 빈 폴더는 무시한다", async () => {
    const images = await readGallery(dir);

    expect(images.some((image) => image.src.includes("loose.jpg"))).toBe(false);
    expect(images.some((image) => image.folder === "empty-folder")).toBe(false);
  });

  it("ARTISTS에 등록된 폴더는 그 작가 정보를 쓴다", async () => {
    const images = await readGallery(dir);
    const parkSeoBo = images.find((image) => image.folder === "park-seo-bo");

    expect(parkSeoBo?.artist.name).toBe("박서보");
    expect(parkSeoBo?.artist.url).toBe(ARTISTS["park-seo-bo"].url);
  });

  it("등록되지 않은 폴더명은 인스타그램 핸들로 본다", async () => {
    const images = await readGallery(dir);
    const unknown = images.find(
      (image) => image.folder === "daily_paintings",
    )?.artist;

    expect(unknown).toEqual({
      name: "daily_paintings",
      url: "https://www.instagram.com/daily_paintings",
    });
  });

  it("작가가 뭉치지 않도록 섞되 호출마다 같은 순서를 준다", async () => {
    const [first, second] = await Promise.all([
      readGallery(dir),
      readGallery(dir),
    ]);

    expect(first.map((image) => image.src)).toEqual(
      second.map((image) => image.src),
    );
    // 폴더명 정렬 그대로면 섞이지 않은 것이다
    const sortedByFolder = [...first]
      .sort((a, b) => a.src.localeCompare(b.src))
      .map((image) => image.src);

    expect(first.map((image) => image.src)).not.toEqual(sortedByFolder);
  });

  it("읽을 수 있는 파일은 원본 치수를 함께 준다", async () => {
    // 벽을 비율대로 세우는 근거다. 치수가 없으면 정사각으로 잘린다.
    const [width, height] = [41, 23];
    const source = path.join(dir, "ppm-source.ppm");
    await fs.writeFile(
      source,
      Buffer.concat([
        Buffer.from(`P6\n${width} ${height}\n255\n`),
        Buffer.alloc(width * height * 3, 0x40),
      ]),
    );
    execFileSync("cwebp", [
      "-quiet",
      source,
      "-o",
      path.join(dir, "park-seo-bo/2026-01-03.webp"),
    ]);

    const images = await readGallery(dir);
    const real = images.find((image) => image.src.endsWith("2026-01-03.webp"));
    const blank = images.find((image) => image.src.endsWith("2026-01-01.jpg"));

    expect(real).toMatchObject({ width, height });
    // 빈 파일은 치수를 못 읽지만 목록에서 빠지지는 않는다
    expect(blank?.width).toBeUndefined();
  });

  it("갤러리 폴더가 없어도 빈 배열을 준다", async () => {
    await expect(readGallery(path.join(dir, "없는-폴더"))).resolves.toEqual([]);
  });
});

describe("shuffle", () => {
  const items = Array.from({ length: 40 }, (_, i) => i);

  it("원소를 잃거나 더하지 않는다", () => {
    expect([...shuffle(items)].sort((a, b) => a - b)).toEqual(items);
  });

  it("호출마다 순서가 달라진다", () => {
    // 40개가 두 번 연속 같은 순서로 나올 확률은 무시할 수 있다
    expect(shuffle(items)).not.toEqual(shuffle(items));
  });

  it("원본을 건드리지 않는다", () => {
    const original = [...items];
    shuffle(items);
    expect(items).toEqual(original);
  });
});

describe("imageKey", () => {
  it("public 경로를 뺀 폴더/파일명이다", () => {
    // URL의 ?image= 값이다. 자리 번호로 두면 섞을 때마다 다른 그림이 열린다
    expect(
      imageKey({ src: "/images/gallery/lee-ufan/10-1978-점으로부터.webp" }),
    ).toBe("lee-ufan/10-1978-점으로부터.webp");
  });
});
