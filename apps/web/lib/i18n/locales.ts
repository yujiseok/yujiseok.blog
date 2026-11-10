export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

export const LOCALE_COOKIE = "NEXT_LOCALE";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** 언어 토글이 선택을 남길 때 `document.cookie`에 넣는 값. */
export const localeCookie = (locale: Locale): string =>
  `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;

export const isLocale = (value: unknown): value is Locale =>
  LOCALES.some((locale) => locale === value);

/** `/posts/x` → `/en/posts/x`. 루트는 `/en`이 된다. 쿼리·해시는 그대로 붙는다. */
export const localizedPath = (locale: Locale, path: string): string =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;

/** `/en/music` → `/music`. 접두사가 없으면 그대로 돌려준다. */
export const stripLocale = (pathname: string): string => {
  const [, first, ...rest] = pathname.split("/");

  return isLocale(first) ? `/${rest.join("/")}` : pathname;
};

/** 같은 경로의 다른 언어 주소. */
export const swapLocale = (pathname: string, locale: Locale): string =>
  localizedPath(locale, stripLocale(pathname));

const POST_PATH = /^\/posts\/([^/]+)$/;

/*
 * 언어 토글이 가리킬 주소. 번역이 없는 글에서 en으로 가면 404이므로 en 글 목록으로
 * 보낸다. 번역이 있는 글(translated)만 같은 글로 간다. 원문(ko)은 늘 있다.
 */
export const languageTogglePath = (
  pathname: string,
  target: Locale,
  translated: ReadonlySet<string>,
): string => {
  const slug = stripLocale(pathname).match(POST_PATH)?.[1];

  return target === "en" && slug !== undefined && !translated.has(slug)
    ? localizedPath(target, "/posts")
    : swapLocale(pathname, target);
};

/** q=0이 아닌 태그 중에 한국어가 있는가. `ko`, `ko-KR` 모두 해당한다. */
const acceptsKorean = (header: string) =>
  header.split(",").some((part) => {
    const [tag = "", ...params] = part.trim().split(";");
    const rejected = params.some((param) => /^q=0(\.0*)?$/.test(param.trim()));

    return !rejected && tag.trim().toLowerCase().split("-")[0] === "ko";
  });

interface PickLocaleInput {
  cookie?: string | null;
  acceptLanguage?: string | null;
}

/*
 * 쿠키 → Accept-Language. 헤더가 없거나 비면 ko — 검색 봇은 헤더를 보내지 않아
 * 여기로 떨어지므로 봇 판별 규칙은 따로 두지 않는다. 한국어가 하나라도 있으면
 * ko, 아니면 en.
 */
export const pickLocale = ({
  cookie,
  acceptLanguage,
}: PickLocaleInput): Locale => {
  if (isLocale(cookie)) return cookie;

  const header = acceptLanguage?.trim();
  if (!header) return DEFAULT_LOCALE;

  return acceptsKorean(header) ? "ko" : "en";
};
