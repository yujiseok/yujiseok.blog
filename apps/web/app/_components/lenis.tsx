"use client";

// Lenis는 html.lenis에 height: auto 등을 거는 자체 스타일에 기대는데,
// 이게 없으면 스크롤 높이 계산이 어긋난다. 지금까지 빠져 있었다.
import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

// children을 감싸는 이유는 app/[locale]/layout.tsx 참고 — 컨텍스트 프로바이더라
// 형제로 두면 useLenis()가 null을 돌려준다. 에디터(개발 서버 전용)는 자체 루트
// 레이아웃이 이 컴포넌트를 쓰지 않아 네이티브 스크롤이다.
const Lenis = ({ children }: { children: ReactNode }) => (
  <ReactLenis root>{children}</ReactLenis>
);

export default Lenis;
