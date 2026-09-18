import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseImageSize, readImageSize } from "./image-size";

/*
 * 실제 파일로 검증한다. 헤더를 손으로 조립한 가짜 바이트는 파서가 틀려도 같이
 * 틀리기 쉽다 — 벽의 비율이 여기 걸려 있으므로 인코더가 만든 파일을 읽힌다.
 */
describe("readImageSize", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "image-size-"));

    // cwebp/기타 인코더 없이도 도는 테스트여야 하므로 PNG는 직접 만든다.
    // PNG는 IHDR이 고정 위치(16~24바이트)라 조립이 곧 규격이다.
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from([0, 0, 0, 13]),
      Buffer.from("IHDR"),
      (() => {
        const size = Buffer.alloc(8);
        size.writeUInt32BE(1234, 0);
        size.writeUInt32BE(567, 4);
        return size;
      })(),
      Buffer.alloc(32),
    ]);
    await fs.writeFile(path.join(dir, "a.png"), png);
    await fs.writeFile(path.join(dir, "empty.webp"), "");
  });

  afterAll(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("PNG의 IHDR에서 치수를 읽는다", async () => {
    await expect(readImageSize(path.join(dir, "a.png"))).resolves.toEqual({
      width: 1234,
      height: 567,
    });
  });

  it("빈 파일과 없는 파일은 undefined다", async () => {
    await expect(
      readImageSize(path.join(dir, "empty.webp")),
    ).resolves.toBeUndefined();
    await expect(
      readImageSize(path.join(dir, "없는파일.webp")),
    ).resolves.toBeUndefined();
  });

  it("cwebp이 만든 WebP를 읽는다", async () => {
    // 갤러리 파일은 전부 cwebp 산출물이다. 이게 틀리면 벽이 정사각으로 무너진다.
    // 입력은 PPM으로 만든다 — 헤더와 픽셀뿐이라 손으로 써도 규격에 맞고,
    // 손으로 조립한 PNG는 CRC가 틀려 인코더가 거부한다(그러면 이 테스트가
    // 조용히 건너뛰어져 검증한 척만 하게 된다).
    const [width, height] = [37, 19];
    const source = path.join(dir, "b.ppm");
    const target = path.join(dir, "b.webp");
    await fs.writeFile(
      source,
      Buffer.concat([
        Buffer.from(`P6\n${width} ${height}\n255\n`),
        Buffer.alloc(width * height * 3, 0x80),
      ]),
    );

    execFileSync("cwebp", ["-quiet", source, "-o", target]);

    expect(parseImageSize(await fs.readFile(target))).toEqual({
      width,
      height,
    });
  });

  it("알 수 없는 형식은 undefined다", () => {
    expect(parseImageSize(Buffer.alloc(64))).toBeUndefined();
  });
});
