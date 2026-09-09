import "./globals.css";
// 본문의 34%가 한글인데 Geist는 라틴만 있다. Pretendard의 dynamic subset은
// 유니코드 범위별로 92개 청크로 쪼개져 있어 실제로 쓰인 글자 범위만 받는다 —
// 변수 폰트 통파일(2MB)을 next/font/local로 싣는 것보다 훨씬 가볍다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Lenis from "./components/lenis";
import { SITE_URL } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yujiseok",
    template: "%s | Yujiseok",
  },
  description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    title: "유지석",
    description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
    url: SITE_URL,
    locale: "ko_KR",
    type: "website",
    siteName: "유지석",
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

const isProd = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} antialiased`}>
      <body className="mx-2 flex flex-col bg-transparent px-4 text-black dark:text-white">
        {/* Lenis가 children을 감싸야 하위의 useLenis()가 인스턴스를 받는다.
            형제로 두면 컨텍스트가 비어 목차 클릭 스크롤이 동작하지 않는다.
            상단에 있던 backdrop-blur 스트립은 배경이 평면이 되면서 할 일이
            없어져 뺐다 — 스크롤마다 재래스터 비용만 들었다. */}
        <Lenis>{children}</Lenis>

        <Analytics />
        <SpeedInsights />
        {isProd && process.env.GA_ID && (
          <GoogleAnalytics gaId={process.env.GA_ID} />
        )}
      </body>
    </html>
  );
}
