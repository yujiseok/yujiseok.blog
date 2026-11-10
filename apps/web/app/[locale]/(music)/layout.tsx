import { PAGE_BOTTOM, PAGE_WIDTH } from "@/app/_components/page-spacing";
import type { Metadata } from "next";
import NavBar from "@/app/[locale]/(music)/_components/nav-bar";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";

// alternates/openGraph.url은 라우트별 값이라 레이아웃에 두면 하위 페이지가 통째로 상속한다.
export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await requireLocale(params);

  return {
    title: {
      default: "Music",
      template: "%s | Music | Yujiseok",
    },
    description: getDictionary(locale).music.description,
  };
}

const Layout = async ({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) => {
  const locale = await requireLocale(params);

  return (
    <>
      <NavBar locale={locale} backLabel={getDictionary(locale).music.back} />
      <main
        id="content"
        className={`mx-auto mt-10 grid w-full gap-10 ${PAGE_WIDTH.default} ${PAGE_BOTTOM}`}
      >
        {children}
      </main>
    </>
  );
};
export default Layout;
