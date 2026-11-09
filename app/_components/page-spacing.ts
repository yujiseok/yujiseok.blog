import { stripLocale } from "@/lib/i18n/locales";

/*
 * 모든 라우트가 같은 자리에서 시작하고 끝나게 하는 세로 여백. 좌우 여백은 루트
 * 레이아웃의 body가 쥐고 있으므로 라우트에서 더하거나 상쇄하지 않는다.
 */
export const PAGE_TOP = "mt-24 sm:mt-28";
export const PAGE_BOTTOM = "mb-16";

/* 라우트별 본문 폭. 언어 토글이 루트 레이아웃에 있어도 본문 끝에 맞출 수 있게 한곳에 둔다. */
export const PAGE_WIDTH = {
  default: "max-w-2xl",
  home: "max-w-[69rem]",
  resume: "max-w-[960px]",
} as const;

/*
 * 페이지 안의 표식을 html:has(...)로 읽지 않고 경로로 고른다. 떠난 페이지는 <Activity>에
 * 숨겨진 채 DOM에 남아서, 표식으로 고르면 다른 라우트까지 그 폭을 따라간다.
 */
export const pageWidth = (pathname: string) => {
  const path = stripLocale(pathname);

  if (path === "/") return PAGE_WIDTH.home;
  if (path === "/resume") return PAGE_WIDTH.resume;
  return PAGE_WIDTH.default;
};
