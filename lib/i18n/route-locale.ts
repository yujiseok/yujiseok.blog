import { isLocale, localizedPath, pickLocale } from "./locales";

interface RouteLocaleInput {
  pathname: string;
  /** `?`를 포함한 쿼리 문자열 */
  search?: string;
  cookie?: string | null;
  acceptLanguage?: string | null;
}

type LocaleRoute = { type: "redirect"; location: string } | { type: "pass" };

/*
 * proxy.ts가 요청마다 묻는 결정. 접두사가 없으면 고른 언어로 보내고, 있으면 그대로
 * 통과시킨다. 쿠키는 읽기만 한다 — 언어 토글을 눌렀을 때만 저장된다. 주소를 여는
 * 것만으로 저장하면 공유받은 /en 링크 하나에 다음 방문까지 영어로 굳는다.
 */
export const routeLocale = ({
  pathname,
  search = "",
  cookie,
  acceptLanguage,
}: RouteLocaleInput): LocaleRoute => {
  const [, first] = pathname.split("/");

  if (isLocale(first)) {
    return { type: "pass" };
  }

  return {
    type: "redirect",
    location: `${localizedPath(pickLocale({ cookie, acceptLanguage }), pathname)}${search}`,
  };
};
