# yujiseok.blog

개인 블로그. Next.js App Router + 파일 기반 MDX.

## 명령

전부 bun으로 돌린다. `npx`는 package.json과 bun.lock을 말없이 고쳐 놓으므로 `bunx`를 쓴다.
명령 목록은 package.json scripts를 본다.

## 완료 기준

`bun run check`(typecheck → lint → test)가 통과하고, 그 명령과 출력을 근거로 제시한 뒤에만
완료라고 말한다. 기능 구현·버그 수정에 들어가면 관련 테스트를 먼저 한 번 돌린다.

화면에 드러나는 변경(UI·글 렌더링)은 사람이 브라우저로 확인한다. 자동 검증이 닿지 않는
구간이므로, 코드 쪽을 끝낸 뒤 무엇을 봐야 하는지 적어 남긴다.

## 글 (content/)

- 프론트매터는 `export const metadata = { ... }` 이고 `published: boolean` 을 반드시 담는다.
  키가 없는 글은 초안으로 친다.
- 초안은 개발 서버 목록에만 나온다. 이 필터는 `lib/content/repository.ts` 한 곳에서만 걸리므로,
  새 소비자(피드·사이트맵·llms.txt)는 그 함수를 거치기만 하면 따로 처리할 게 없다.
- 본문은 포매터 대상이 아니다(.prettierignore). 에디터가 MDX를 직접 직렬화하기 때문이고,
  prettier를 다시 걸면 저장할 때마다 diff가 튄다.

## 함정

- `cacheComponents` 가 켜져 있다. `generateStaticParams` 가 빈 배열을 반환하면 그 자체로 빌드가
  깨지므로, 외부 API(Spotify)에 기대는 라우트는 `export const instant = false` 로 둔다.
- `/editor` 는 개발 서버 전용이다. 서버 액션마다 `assertDevOnly()` 가 걸려 있다.
- `app/[locale]/(main)/atelier` 는 살아 있는 라우트지만 내비 어디에도 링크하지 않는다.

## 관례

- 커밋 메시지는 한국어. `type: 무엇을 했는지` 형식.
- 파일명은 kebab-case. 컴포넌트는 그것을 쓰는 라우트 옆 `_components/` 에 둔다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
