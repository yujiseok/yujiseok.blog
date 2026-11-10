# web

블로그 앱. Next.js App Router + 파일 기반 MDX. 저장소 공통 규칙은 루트 `AGENTS.md`에 있다.
경로는 모두 이 디렉터리(`apps/web`) 기준이다.

## 글 (content/)

- 프론트매터는 `export const metadata = { ... }` 이고 `published: boolean` 을 반드시 담는다.
  키가 없는 글은 초안으로 친다.
- 초안은 개발 서버 목록에만 나온다. 이 필터는 `lib/content/repository.ts` 한 곳에서만 걸리므로,
  새 소비자(피드·사이트맵·llms.txt)는 그 함수를 거치기만 하면 따로 처리할 게 없다.
- 본문은 포매터 대상이 아니다(.prettierignore). 에디터가 MDX를 직접 직렬화하기 때문이고,
  prettier를 다시 걸면 저장할 때마다 diff가 튄다.
- 공개 글을 쓰거나 고치면 `bun run translate`로 `slug.en.mdx`를 만들고 `content/.translations.json`과
  함께 커밋한다. Vercel 빌드는 번역하지 않으므로, 빠뜨리면 그 글의 `/en` 주소가 404다. pre-push 훅이
  경고만 낸다(루트 `.githooks/`, `bun install`이 연결한다).
- 번역본을 손으로 고쳐도 되지만 원문이 바뀌면 다시 번역되어 덮인다. MDX 컴포넌트 안의 문구는 번역
  대상이 아니라 컴포넌트에 언어별로 직접 둔다.

## 함정

- `cacheComponents` 가 켜져 있다. `generateStaticParams` 가 빈 배열을 반환하면 그 자체로 빌드가
  깨지므로, 외부 API(Spotify)에 기대는 라우트는 `export const instant = false` 로 둔다.
- `cacheComponents` 아래에서는 떠난 페이지가 `<Activity>`로 숨겨진 채 DOM에 남는다. `html:has(...)`처럼
  페이지 안의 표식으로 전역 스타일을 바꾸면 다른 라우트까지 따라온다.
- `/editor` 는 개발 서버 전용이다. 서버 액션마다 `assertDevOnly()` 가 걸려 있다.

## 관례

- 컴포넌트는 그것을 쓰는 라우트 옆 `_components/` 에 둔다.

## 이력서

- 페이지 내용의 원본은 `app/[locale]/resume/resume.ts`, `resume.en.ts`다.
- PDF(`public/resume.pdf`)는 지금 손으로 만들어 넣는다. 페이지 내용을 고쳤으면 PDF도 다시 만들어 함께
  커밋한다. 새 언어의 PDF를 처음 넣으면 `resolve.ts`의 `PUBLISHED_PDF_LOCALES`에 추가한다(빠뜨리면 링크가
  안 나오고, 파일 없이 추가하면 테스트가 깨진다).
- Figma 동기화(`apps/figma-resume-sync` 플러그인, `/resume.json`, `bun run resume:pdf`)는 코드만 두고 쓰지
  않는다. 실제 Figma에서 돌려 본 적이 없으니 다시 쓸 때는 검증부터 한다. 플러그인은 이력서 타입을 복사해
  쓰므로 resume.ts의 필드 구조가 바뀌었으면 그쪽 타입도 맞춘다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
