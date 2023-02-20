import "./globals.css";
import localFont from "@next/font/local";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";

const pretendard = localFont({
  src: "../public/fonts/Pretendard-Regular.woff2",
  weight: "400",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yujiseok",
    template: "%s | Yujiseok",
  },
  description: "",
  icons: {
    shortcut: "/favicon.ico",
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
      <body className="max-w-3xl antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
