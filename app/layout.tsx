import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import ThemeProviders from "@/app/components/provider";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";

const pretendard = localFont({
  src: [
    {
      path: "../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/Pretendard-SemiBold.woff2",
      weight: "600",
    },
    {
      path: "../public/fonts/Pretendard-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yujiseok.blog"),
  title: {
    default: "Yujiseok",
    template: "%s | Yujiseok",
  },
  description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
  openGraph: {
    title: "유지석",
    description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
    url: "https://www.yujiseok.blog/",
    locale: "ko_KR",
    type: "website",
    siteName: "유지석",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "standard",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} font-sans`}>
      <body className="mx-2 flex flex-col bg-neutral-50 antialiased transition-colors delay-100 dark:bg-neutral-800">
        <ThemeProviders>
          <Navbar />
          <main className="mx-auto mt-14 w-full max-w-3xl px-4">
            {children}
          </main>
          <Footer />
        </ThemeProviders>
        <Analytics />
        <SpeedInsights />

        <GoogleAnalytics gaId={process.env.GA_ID!} />
      </body>
    </html>
  );
}
