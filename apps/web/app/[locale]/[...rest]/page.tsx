import { notFound } from "next/navigation";

/*
 * /ko/없는-주소 처럼 접두사는 맞는데 라우트가 없는 경로를 받아 [locale]의
 * not-found를 그리게 한다. 이게 없으면 접두사 밖의 global-not-found가 나와
 * 언어를 잃는다. 파라미터를 읽지 않으므로 빌드 때 따로 준비할 값이 없다.
 *
 * 스트리밍 전에 던지므로 상태 코드는 404다. 다만 cacheComponents에서는 이 경우
 * 서버 HTML 본문이 비고(<html id="__next_error__">) not-found 화면은 하이드레이션
 * 뒤에 그려진다. 응답이 200이 되는 Suspense 안 호출과 맞바꾼 선택이다.
 */
/*
 * 항상 notFound()를 던지는 페이지라 instant 검증이 그릴 대상이 없다. 켜 두면
 * 개발 서버가 요청마다 "Could not validate `instant`" 에러를 찍는다.
 */
export const instant = false;

export default function CatchAll() {
  notFound();
}
