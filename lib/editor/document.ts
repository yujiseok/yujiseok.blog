export interface PostMetadata {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
}

export interface PostDocument {
  metadata: PostMetadata;
  body: string;
}

// 본문의 } 에 속지 않도록 0열의 닫는 중괄호까지만 비탐욕적으로 집는다
const METADATA_EXPORT = /^export const metadata = (\{[\s\S]*?\n\})\n/;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 100;

export const serializePost = ({ metadata, body }: PostDocument): string =>
  // 키 순서를 정렬하지 않고 받은 그대로 흘려보낸다. writing 은 title·publishedAt·summary,
  // atelier 는 title·summary·publishedAt·image 순이라 정렬하면 기존 글이 왕복에서 변형된다.
  // JSON.stringify 가 undefined 인 image 를 알아서 빼준다
  `export const metadata = ${JSON.stringify(metadata, null, 2)}\n\n${body.trimEnd()}\n`;

export const parsePost = (source: string): PostDocument => {
  const match = source.match(METADATA_EXPORT);

  if (!match) {
    throw new Error("metadata export를 찾지 못했습니다");
  }

  return {
    metadata: JSON.parse(match[1]) as PostMetadata,
    body: source.slice(match[0].length).trim(),
  };
};

export const isValidSlug = (slug: string): boolean =>
  slug.length <= MAX_SLUG_LENGTH && SLUG.test(slug);

// 한글 제목은 남는 문자가 없어 빈 문자열이 된다. 호출부가 직접 입력을 받아야 한다
export const toSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
