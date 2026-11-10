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

- 내용의 원본은 `app/[locale]/resume/resume.ts`, `resume.en.ts` 하나다. 블로그, Figma, PDF가 모두 여기서
  나온다. Figma에서 글자를 직접 고치면 다음 동기화 때 덮어써진다.
- 디자인의 원본은 Figma 파일의 「Resume Template」 페이지(컴포넌트, 텍스트 스타일 `Resume/*`, 간격 변수
  `Resume/space/*`)다. 플러그인은 이 페이지가 없을 때만 만들고, 이후로는 손대지 않는다.
- 갱신 순서:
  1. resume.ts를 고친다.
  2. 개발 서버를 켠 채 Figma 데스크톱 앱에서 Resume Sync 플러그인을 실행한다. 처음 한 번은 루트에서
     `bun run resume:plugin`으로 빌드한 뒤 `apps/figma-resume-sync/manifest.json`을 가져온다.
  3. `bun run resume:pdf`로 `public/resume.pdf`, `public/resume.en.pdf`를 만든다(`.env`의 `FIGMA_TOKEN` 필요).
  4. 새 언어의 PDF를 처음 넣었으면 `resolve.ts`의 `PUBLISHED_PDF_LOCALES`에 추가하고, PDF까지 함께 커밋한다.
- 플러그인이 읽는 `/resume.json`은 개발 서버에서만 열린다.
- 플러그인(`apps/figma-resume-sync/src/code.ts`)은 이력서 타입을 복사해 쓴다. resume.ts의 필드 구조를
  바꾸면 그쪽 타입도 같이 고친다. 어긋나도 컴파일은 통과하고 동기화할 때 깨진다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
