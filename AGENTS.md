# yujiseok.blog

개인 블로그 모노레포. Turborepo + Bun workspaces.

## 구조

- `apps/web`: 블로그(Next.js). 글(`content/`), 번역·PDF 스크립트도 여기 있다. 규칙은 `apps/web/AGENTS.md`.
- `apps/figma-resume-sync`: 이력서를 Figma에 그리는 플러그인. 지금은 쓰지 않고 코드만 둔다(`apps/web/AGENTS.md` 이력서 절).
- 공유 패키지(`packages/`)는 두지 않는다. 앱이 하나라 필요해질 때 만든다.

## 명령

전부 bun으로 돌린다. `npx`는 package.json과 bun.lock을 말없이 고쳐 놓으므로 `bunx`를 쓴다.
태스크는 루트에서 `bun run <script>`로 부르고, 루트 스크립트가 `turbo run`으로 각 앱에 나눠 준다.
`turbo` 호출은 루트 package.json에만 둔다(앱 스크립트에 넣으면 재귀 호출된다).

- 빌드에 쓰는 환경변수는 `turbo.json`의 `env`에 선언한다. strict 모드라 선언하지 않은 변수는
  태스크에 전달되지 않는다(Vercel 빌드 포함).
- 의존성은 쓰는 앱의 package.json에 직접 적는다. Bun이 앱마다 격리해 설치하므로, 다른 패키지를 통해
  들어오던 타입(`@types/mdast` 등)도 직접 선언해야 한다.

## 완료 기준

`bun run check`(두 앱의 typecheck·test + prettier)가 통과하고, 그 명령과 출력을 근거로 제시한 뒤에만
완료라고 말한다. 기능 구현·버그 수정에 들어가면 관련 테스트를 먼저 한 번 돌린다.

화면에 드러나는 변경(UI·글 렌더링)은 사람이 브라우저로 확인한다. 자동 검증이 닿지 않는
구간이므로, 코드 쪽을 끝낸 뒤 무엇을 봐야 하는지 적어 남긴다.

## 관례

- 커밋 메시지는 한국어. `type: 무엇을 했는지` 형식.
- 파일명은 kebab-case.
