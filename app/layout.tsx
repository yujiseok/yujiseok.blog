import "./globals.css";

import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/app/components/footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yujiseok.blog"),
  title: "Yujiseok",
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

const isProd = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} antialiased`}>
      <body className="mx-2 flex flex-col gap-40 bg-white px-4 text-black dark:bg-black dark:text-white">
        <div className="pointer-events-none fixed inset-0 z-10 h-10 w-full mask-[linear-gradient(to_bottom,black,transparent)] backdrop-blur-2xl select-none" />

        {children}
        <Footer />

        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId={isProd ? process.env.GA_ID! : ""} />
      </body>
    </html>
  );
}
