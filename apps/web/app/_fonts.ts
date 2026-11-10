import { Geist } from "next/font/google";

// 루트 레이아웃이 둘(app/[locale], app/editor)이라 폰트 선언은 한 곳에서 나눠 쓴다.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
