// "use client";

import "./globals.css";
import localFont from "@next/font/local";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
import ThemeProviders from "@/components/providers";

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
  title: {
    default: "Yujiseok",
    template: "%s | Yujiseok",
  },
  description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
  icons: {
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: {
      absolute: "유지석",
    },
    description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
    url: "https://www.yujiseok.blog/",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} font-sans`}>
      <head />
      <body className="flex min-h-screen flex-col bg-slate-50 antialiased transition-colors delay-75 dark:bg-slate-800">
        <ThemeProviders>
          <Navbar />
          <main className="mx-auto mt-14 w-full max-w-2xl px-4">
            {children}
          </main>
          {/* <Footer /> */}
        </ThemeProviders>
      </body>
    </html>
  );
}
