import fs from "node:fs/promises";

/*
 * 이미지 파일의 치수만 읽는다. 폴더를 훑어 만든 갤러리는 정적 import가 아니라
 * 원본 치수를 알 수 없고, 치수를 모르면 벽을 비율대로 세울 수 없다(전부 정사각으로
 * 잘라야 한다). 헤더 몇 바이트만 필요한 일이라 파일 앞부분만 읽는다 — 디코딩도,
 * 패키지도 필요 없다.
 */
const HEADER_BYTES = 64 * 1024;

export interface ImageSize {
  width: number;
  height: number;
}

const png = (data: Buffer): ImageSize => ({
  width: data.readUInt32BE(16),
  height: data.readUInt32BE(20),
});

const gif = (data: Buffer): ImageSize => ({
  width: data.readUInt16LE(6),
  height: data.readUInt16LE(8),
});

/*
 * WebP은 RIFF 컨테이너라 첫 청크 이름으로 갈린다. VP8X(확장)는 24비트 canvas에
 * 1을 뺀 값이, VP8(손실)은 프레임 헤더에, VP8L(무손실)은 14비트씩 묶인 비트필드에
 * 들어 있다. cwebp가 만든 파일은 대개 VP8이다.
 */
const webp = (data: Buffer): ImageSize | undefined => {
  const chunk = data.toString("ascii", 12, 16);

  if (chunk === "VP8X")
    return {
      width: (data.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (data.readUIntLE(27, 3) & 0xffffff) + 1,
    };

  if (chunk === "VP8 ")
    return {
      width: data.readUInt16LE(26) & 0x3fff,
      height: data.readUInt16LE(28) & 0x3fff,
    };

  if (chunk === "VP8L") {
    const bits = data.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return undefined;
};

/*
 * JPEG은 치수가 파일 앞 고정 위치에 없다. 마커를 따라가다 SOF(0xC0~0xCF, 단 C4·C8·CC
 * 제외 — 그건 허프만 테이블이다)를 만나면 그 안에 높이·너비가 있다.
 */
const jpeg = (data: Buffer): ImageSize | undefined => {
  let offset = 2;

  while (offset + 9 < data.length) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = data[offset + 1];

    // 독립 마커(SOI·EOI·RSTn)는 길이 필드가 없다
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }

    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isStartOfFrame)
      return {
        width: data.readUInt16BE(offset + 7),
        height: data.readUInt16BE(offset + 5),
      };

    offset += 2 + data.readUInt16BE(offset + 2);
  }

  return undefined;
};

export const parseImageSize = (data: Buffer): ImageSize | undefined => {
  if (data.length < 32) return undefined;

  if (data.toString("ascii", 1, 4) === "PNG") return png(data);
  if (data.toString("ascii", 0, 3) === "GIF") return gif(data);
  if (
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WEBP"
  )
    return webp(data);
  if (data[0] === 0xff && data[1] === 0xd8) return jpeg(data);

  return undefined;
};

/** 읽을 수 없는 파일(빈 파일, AVIF 등)은 undefined다 — 부르는 쪽이 정사각으로 세운다 */
export const readImageSize = async (
  file: string,
): Promise<ImageSize | undefined> => {
  let handle;

  try {
    handle = await fs.open(file, "r");
    const { buffer, bytesRead } = await handle.read(
      Buffer.alloc(HEADER_BYTES),
      0,
      HEADER_BYTES,
      0,
    );

    return parseImageSize(buffer.subarray(0, bytesRead));
  } catch {
    return undefined;
  } finally {
    await handle?.close();
  }
};
