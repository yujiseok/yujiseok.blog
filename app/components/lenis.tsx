"use client";

// Lenis는 html.lenis에 height: auto 등을 거는 자체 스타일에 기대는데,
// 이게 없으면 스크롤 높이 계산이 어긋난다. 지금까지 빠져 있었다.
import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";

const Lenis = () => {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />;
};

export default Lenis;
