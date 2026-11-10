import "@/app/globals.css";
// 본문의 34%가 한글인데 Geist는 라틴만 있다. Pretendard의 dynamic subset은
// 유니코드 범위별로 92개 청크로 쪼개져 있어 실제로 쓰인 글자 범위만 받는다 —
// 변수 폰트 통파일(2MB)을 next/font/local로 싣는 것보다 훨씬 가볍다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";

import { geistSans } from "@/app/_fonts";
import { LanguageToggle } from "@/app/_components/language-toggle";
import Lenis from "@/app/_components/lenis";
import { LocaleProvider } from "@/app/_components/locale-provider";
import { SITE_URL } from "@/lib/constants";
import { getTranslatedSlugs } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, LOCALES, localizedPath } from "@/lib/i18n/locales";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";
import { alternates, siteOg } from "@/lib/metadata";

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const { site } = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Yujiseok",
      template: "%s | Yujiseok",
    },
    description: site.description,
    alternates: alternates(locale, "/"),
    openGraph: {
      title: site.name,
      description: site.description,
      url: `${SITE_URL}${localizedPath(locale, "/")}`,
      type: "website",
      ...siteOg(locale),
    },
    // title/description는 postProcessMetadata가 openGraph → title 순으로 자동 채운다.
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const isProd = process.env.NODE_ENV === "production";

export default async function RootLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const locale = await requireLocale(params);

  const dictionary = getDictionary(locale);
  // 언어 토글이 번역 없는 글에서 404로 보내지 않도록 번역된 slug만 안다
  const translated = [...(await getTranslatedSlugs())];

  return (
    <html lang={locale} className={`${geistSans.variable} antialiased`}>
      <body className="mx-2 flex flex-col bg-transparent px-4 text-black dark:text-white print:m-0 print:p-0">
        {/* 스크린리더·키보드 사용자가 내비게이션을 매번 다 훑지 않고 본문으로
            바로 뛸 수 있게 한다. 평소엔 화면에서 숨겨두고 포커스를 받을 때만
            보인다. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white dark:focus:bg-white dark:focus:text-black"
        >
          {dictionary.site.skipToContent}
        </a>
        <LanguageToggle
          locale={locale}
          translated={translated}
          labels={dictionary.languageToggle}
        />
        {/* Lenis가 children을 감싸야 하위의 useLenis()가 인스턴스를 받는다.
            형제로 두면 컨텍스트가 비어 목차 클릭 스크롤이 동작하지 않는다. */}
        <LocaleProvider
          locale={locale}
          codeBlock={dictionary.codeBlock}
          error={dictionary.error}
        >
          <Lenis>{children}</Lenis>
        </LocaleProvider>

        <Analytics />
        <SpeedInsights />
        {isProd && process.env.GA_ID && (
          <GoogleAnalytics gaId={process.env.GA_ID} />
        )}
      </body>
    </html>
  );
}
