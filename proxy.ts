import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";

/*
 * 접두사 없는 주소를 /ko, /en으로 보낸다. 판단은 lib/i18n/route-locale.ts에 있고
 * 여기는 요청·응답을 잇기만 한다.
 */
export function proxy(request: NextRequest) {
  const route = routeLocale({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });

  if (route.type === "pass") {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL(route.location, request.url));
  // 같은 주소가 헤더·쿠키에 따라 다른 곳으로 가므로 공유 캐시가 섞지 않게 한다
  response.headers.set("vary", "accept-language, cookie");

  return response;
}

/*
 * 제외: _next, Vercel 분석 비콘(_vercel), 정적 이미지, 확장자가 있는 모든 경로(.md·.xml·.txt·favicon),
 * 에디터(한국어 전용, 접두사 밖), 마크다운 라우트 핸들러(/md). 하위 경로까지
 * 닫도록 세그먼트 경계(/ 또는 끝)를 함께 본다.
 */
export const config = {
  matcher: [
    "/((?!_next(?:/|$)|_vercel(?:/|$)|images(?:/|$)|editor(?:/|$)|md(?:/|$)|.*\\..*).*)",
  ],
};
