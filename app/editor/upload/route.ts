import fs from "node:fs/promises";
import path from "node:path";

import { isValidSlug } from "@/lib/editor/document";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

/** 스크린샷 한 장이 이걸 넘길 일은 없다. 실수로 원본 RAW를 고르는 걸 막는 선 */
const MAX_BYTES = 10 * 1024 * 1024;

// MIME은 클라이언트가 부르는 대로라 믿을 수 없다. 확장자 화이트리스트가
// 이 라우트가 디스크에 남기는 파일 종류의 유일한 기준이다.
const ALLOWED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
];

const MAX_BASE_NAME_LENGTH = 80;
/** 같은 이름이 이만큼 쌓이면 이름을 잘못 짓고 있는 것이다 */
const MAX_NAME_ATTEMPTS = 100;

const fail = (status: number, message: string) =>
  Response.json({ message }, { status });

/**
 * 파일명은 신뢰 경계 밖의 입력이다. 확장자를 화이트리스트로 자르고, 남은
 * 이름에서 소문자 영숫자·하이픈·점 외에는 전부 지워 "../"나 숨김 파일 같은
 * 경로 조작의 재료 자체를 없앤다. 한글 파일명은 남는 글자가 없어 비게 되는데,
 * 거절하는 대신 image로 떨어뜨린다 — 스크린샷 이름 때문에 업로드가 막히면 곤란하다.
 */
function normalizeFileName(
  original: string,
): { base: string; ext: string } | null {
  const ext = path.extname(original).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return null;

  const base =
    path
      .basename(original, path.extname(original))
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, MAX_BASE_NAME_LENGTH)
      .replace(/[-.]+$/, "") || "image";

  return { base, ext };
}

const candidateNames = (base: string, ext: string): string[] => [
  `${base}${ext}`,
  ...Array.from(
    { length: MAX_NAME_ATTEMPTS - 1 },
    (_, index) => `${base}-${index + 1}${ext}`,
  ),
];

/**
 * 이미 있는 파일은 절대 덮어쓰지 않는다 — 같은 이름의 스크린샷을 다시 올렸다고
 * 예전 글의 이미지가 조용히 바뀌면 안 된다. wx 플래그는 파일이 있으면 실패하므로
 * "확인 후 쓰기"와 달리 확인과 쓰기 사이에 끼어들 틈이 없다.
 */
async function writeWithoutOverwrite(
  dir: string,
  names: string[],
  data: Uint8Array,
): Promise<string> {
  for (const name of names) {
    // 정규화를 통과한 이름이라도 디스크에 닿기 직전 최종 경로를 다시 확인한다.
    // 검증 규칙이 나중에 느슨해져도 이 검사는 남는다.
    const filePath = path.resolve(dir, name);
    if (path.dirname(filePath) !== dir) {
      throw new Error("허용되지 않은 경로입니다.");
    }

    try {
      await fs.writeFile(filePath, data, { flag: "wx" });
      return name;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }

  throw new Error("같은 이름의 파일이 너무 많습니다. 파일명을 바꿔 주세요.");
}

/**
 * 에디터 이미지 업로드. app/editor/actions.ts와 마찬가지로 로컬 글쓰기 도구
 * 전용이고, Route Handler는 페이지와 무관한 별개의 공개 엔드포인트라 dev 가드를
 * 여기서 독립적으로 다시 건다 — 프로덕션에 노출되면 임의 파일 쓰기가 된다.
 *
 * Server Action이 아닌 이유는 본문 크기 제한(기본 1MB)이다. 스크린샷 한 장에도
 * 걸리는데, 그걸 풀려면 next.config의 전역 설정을 건드려 프로덕션까지 영향을 준다.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const slug = formData.get("slug");

  if (!(file instanceof File)) {
    return fail(400, "이미지 파일이 없습니다.");
  }
  if (typeof slug !== "string" || !isValidSlug(slug)) {
    return fail(400, "이미지를 올리려면 슬러그를 먼저 정하세요.");
  }
  if (file.size === 0) {
    return fail(400, "빈 파일입니다.");
  }
  if (file.size > MAX_BYTES) {
    return fail(
      413,
      `이미지는 ${MAX_BYTES / 1024 / 1024}MB 이하만 올릴 수 있습니다.`,
    );
  }

  const normalized = normalizeFileName(file.name);
  if (!normalized) {
    return fail(
      415,
      `지원하지 않는 형식입니다. ${ALLOWED_EXTENSIONS.join(" ")} 만 올릴 수 있습니다.`,
    );
  }

  // isValidSlug 통과만으로 끝내지 않고, resolve된 디렉터리가 실제로 IMAGES_DIR
  // 바로 아래인지 다시 검사한다(actions.ts의 resolvePostPath와 같은 방식).
  const dir = path.resolve(IMAGES_DIR, slug);
  if (path.dirname(dir) !== IMAGES_DIR) {
    return fail(400, "허용되지 않은 경로입니다.");
  }

  try {
    await fs.mkdir(dir, { recursive: true });
    const name = await writeWithoutOverwrite(
      dir,
      candidateNames(normalized.base, normalized.ext),
      new Uint8Array(await file.arrayBuffer()),
    );

    return Response.json({ src: `/images/${slug}/${name}` });
  } catch (error) {
    return fail(
      500,
      error instanceof Error ? error.message : "이미지를 저장하지 못했습니다.",
    );
  }
}
