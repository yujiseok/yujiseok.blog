import { resolveResume, SECTION_TITLES } from "@/app/[locale]/resume/resolve";
import { getTranslatedSlugs } from "@/lib/content/repository";

/*
 * Figma 플러그인(figma/resume-sync)이 읽는 이력서 원본. 개발 서버에서만 연다.
 * 프로덕션에서는 404라 사이트에 새 공개 주소가 생기지 않는다. 플러그인은 null 출처에서
 * 요청하므로 CORS를 연다.
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  const translated = await getTranslatedSlugs();
  const body = {
    sectionTitles: SECTION_TITLES,
    ko: resolveResume("ko", translated),
    en: resolveResume("en", translated),
  };

  return Response.json(body, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
    },
  });
}
