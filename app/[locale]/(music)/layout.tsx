import type { Metadata } from "next";
import NavBar from "@/app/[locale]/(music)/_components/nav-bar";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale } from "@/lib/i18n/params";

type LayoutParams = { params: Promise<{ locale: string }> };

// alternates/openGraph.url은 라우트별 값이라 레이아웃에 두면 하위 페이지가 통째로 상속한다.
export async function generateMetadata({
  params,
}: LayoutParams): Promise<Metadata> {
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
}: LayoutParams & { children: React.ReactNode }) => {
  const locale = await requireLocale(params);

  return (
    <>
      <NavBar locale={locale} backLabel={getDictionary(locale).music.back} />
      <main
        id="content"
        className="mx-auto mt-14 mb-16 grid w-full max-w-2xl gap-10 md:p-2"
      >
        {children}
      </main>
    </>
  );
};
export default Layout;
