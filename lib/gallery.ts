import fs from "node:fs/promises";
import path from "node:path";

import { readImageSize } from "@/lib/image-size";

/*
 * 이미지를 추가하는 절차는 "폴더에 파일 떨구기" 하나다. 등록 파일에 한 줄씩
 * 적는 방식은 손이 가는 쪽이 늘 뒤처져서, 파일은 있는데 화면엔 없는 상태를
 * 만든다. 대신 디렉터리 구조 자체를 데이터로 읽는다 — 하위 폴더명이 작가다.
 */
export const GALLERY_DIR = path.join(process.cwd(), "public/images/gallery");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export interface Artist {
  name: string;
  /** 출처. 없으면 카드를 링크로 만들지 않는다 */
  url?: string;
}

export interface GalleryImage {
  /** next/image에 넘길 public 기준 경로 */
  src: string;
  /** 폴더명. key이자 작가를 찾는 열쇠다 */
  folder: string;
  artist: Artist;
  /** 파일명에서 읽어 낸 작품명. 알 수 없으면 없다 */
  title?: string;
  /** 네 자리 제작연도 */
  year?: string;
  /*
   * 원본 치수. 벽을 비율대로 세우는 데 쓴다 — 이걸 모르면 정사각으로 잘라야 한다.
   * 헤더를 못 읽는 파일도 있으므로 없을 수 있다.
   */
  width?: number;
  height?: number;
}

/*
 * 폴더명은 여기 없으면 인스타그램 핸들로 본다. 저장해 둔 이미지의 출처가
 * 대부분 거기라 규칙 하나로 링크까지 만들 수 있다. 화가처럼 핸들이 없는
 * 출처만 이 표에 적는다.
 */
export const ARTISTS: Record<string, Artist> = {
  "park-seo-bo": {
    name: "박서보",
    url: "https://www.kukjegallery.com/artists/view?seq=181",
  },
  "yun-hyong-keun": {
    name: "윤형근",
    url: "https://www.pkmgallery.com/artists/estate-of-yun-hyong-keun/biography",
  },
  "chung-sang-hwa": {
    name: "정상화",
    url: "https://www.kukjegallery.com/artists/view?seq=343",
  },
  "ha-chong-hyun": {
    name: "하종현",
    url: "https://www.kukjegallery.com/artists/view?seq=344",
  },
  "kim-tschang-yeul": {
    name: "김창열",
    url: "https://kimtschang-yeul.jeju.go.kr/colectionList.do?menuNum=5100",
  },
  "lee-ungno": {
    name: "이응노",
    url: "https://www.leeungnomuseum.or.kr/",
  },
  "chang-ucchin": {
    name: "장욱진",
    url: "https://www.yangju.go.kr/changucchin/selectBbsNttList.do?key=2011&bbsNo=116",
  },
  "rhee-seundja": {
    name: "이성자",
    url: "https://www.jinju.go.kr/rheesjmuseum/",
  },
  "kwon-young-woo": {
    name: "권영우",
    url: "https://www.kukjegallery.com/artists/view?seq=351",
  },
  "lee-dai-won": {
    name: "이대원",
    url: "https://hyundaihwarang.com/?c=artist&s=1&gbn=view&gp=1&ix=132",
  },
  "chun-kyung-ja": {
    name: "천경자",
    url: "https://sema.seoul.go.kr/ct/chun/collection/getList",
  },
  "yoo-young-kuk": {
    name: "유영국",
    url: "https://www.pkmgallery.com/artists/estate-of-yoo-youngkuk/biography",
  },
  "kim-whanki": {
    name: "김환기",
    url: "https://www.kukjegallery.com/artists/view?seq=353",
  },
  "lee-ufan": {
    name: "이우환",
    url: "https://www.kukjegallery.com/artists/view?seq=190",
  },
  "piet-mondrian": {
    name: "Piet Mondrian",
    url: "https://www.artic.edu/artists/35192/piet-mondrian",
  },
  "wassily-kandinsky": {
    name: "Wassily Kandinsky",
    url: "https://www.artic.edu/artists/36048/vasily-kandinsky",
  },
  "hilma-af-klint": {
    name: "Hilma af Klint",
    url: "https://www.modernamuseet.se/stockholm/en/exhibitions/hilma-af-klint/",
  },
  "mark-rothko": {
    name: "Mark Rothko",
    url: "https://www.nga.gov/artists/1839-mark-rothko",
  },
  yujiseok: { name: "유지석", url: "https://yujiseok.blog" },
};

/*
 * 작품명을 따로 적어 두는 표를 만들면 파일과 표가 어긋나기 시작한다. 파일명이
 * 곧 캡션이다 — 네 자리 연도가 보이면 연도로 읽고, 그 뒤에 남는 말이 있으면
 * 작품명으로 읽는다. 출처마다 파일명이 제각각이라 읽히는 것만 읽고 나머지는
 * 작가 이름만 보여 준다. 캡션을 고치고 싶으면 파일 이름을 고치면 된다.
 */
export const parseCaption = (file: string) => {
  const base = file.replace(/\.[^.]+$/, "");
  const match = base.match(/(?:^|[-_])((?:18|19|20)\d{2})(?![\d])[-_]?(.*)$/);

  if (!match) return {};

  const [, year, rest] = match;
  const title = rest.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

  return { year, title: title || undefined };
};

const toArtist = (folder: string): Artist =>
  ARTISTS[folder] ?? {
    name: folder,
    url: `https://www.instagram.com/${folder}`,
  };

/*
 * 폴더 순서나 파일명으로 세우면 같은 작가가 줄줄이 붙어 벽이 단조로워진다.
 * 그렇다고 Math.random()을 쓰면 빌드마다, 심지어 요청마다 배치가 달라져
 * 같은 화면을 두 번 볼 수 없다. 경로를 해시해 순서를 만들면 섞인 채로
 * 고정된다 — 파일을 추가하기 전까지 배치는 그대로다. (FNV-1a)
 */
const hash = (value: string) => {
  let h = 2166136261;

  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
};

/*
 * "use cache"는 vitest에서 동작하지 않으므로 캐시 래퍼와 실제 수집을 나눈다.
 * lib/content/repository.ts의 readAllContent와 같은 구조다.
 */
export const readGallery = async (
  dir: string = GALLERY_DIR,
): Promise<GalleryImage[]> => {
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    // 폴더를 아직 만들지 않았어도 빌드는 지나가야 한다
    .catch(() => []);

  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const images = await Promise.all(
    folders.map(async (folder) => {
      const files = await fs.readdir(path.join(dir, folder)).catch(() => []);

      const images = files.filter((file) =>
        IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()),
      );

      return Promise.all(
        images.map(async (file) => ({
          src: `/images/gallery/${folder}/${file}`,
          folder,
          artist: toArtist(folder),
          ...parseCaption(file),
          // 파일 앞부분만 읽는다. "use cache" 안이라 빌드/캐시당 한 번이다
          ...(await readImageSize(path.join(dir, folder, file))),
        })),
      );
    }),
  );

  return images.flat().sort((a, b) => hash(a.src) - hash(b.src));
};

/*
 * 접근할 때마다 벽의 배치가 달라진다. 순서를 캐시 안에서 만들면 캐시가 살아 있는
 * 동안 같은 벽이 나오므로, 캐시(getGallery)는 디렉터리를 읽은 결과만 쥐고 섞는
 * 일은 밖에서 요청마다 한다. Fisher-Yates.
 */
export const shuffle = <T>(items: readonly T[]): T[] => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export const getGallery = async () => {
  "use cache";

  return readGallery();
};
