"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/cn";
import type { TocEntry } from "@/lib/content/toc";

// Lenis의 scrollTo는 요소의 scroll-margin-top을 이미 반영한다. 여기에 또
// 여백을 더하면 해시로 진입했을 때와 클릭했을 때의 착지가 어긋난다. 그래서
// scrollTo에 offset을 주지 않고, 여백은 article의 prose-headings:scroll-mt 한
// 곳이 정한다. 착지 확인용 값은 그 scroll-mt-8(2rem)과 같다.
const HEADING_SCROLL_MARGIN = 32;

// 이 비율 위로 올라간 제목을 "지나갔다"고 본다
const SPY_LINE = 0.3;

const isAtBottom = () =>
  window.innerHeight + window.scrollY >=
  document.documentElement.scrollHeight - 4;

export const TableOfContents = ({
  entries,
  label,
}: {
  entries: TocEntry[];
  label: string;
}) => {
  const lenis = useLenis();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // 목차는 xl 미만에서 hidden으로 아예 그려지지 않는다(아래 aside 참고).
    // 그런데 이 스캔은 항상 붙어 있었다 — 안 보이는 화면에서도 스크롤·리사이즈마다
    // 헤딩 rect를 다 훑고 있었다는 뜻이다. 미디어쿼리가 맞을 때만 리스너를
    // 붙이고, xl로 넘어오는 순간(change)에만 새로 붙인다.
    const mql = window.matchMedia("(min-width: 1280px)");

    let cleanup: (() => void) | undefined;

    const attach = () => {
      const headings = entries
        .map(({ id }) => document.getElementById(id))
        .filter((element) => element !== null);

      /*
       * 활성 항목은 "기준선(뷰포트 위 30%)을 지나 올라간 마지막 제목"이다.
       * "지금 밴드 안에 있는 제목"으로 잡으면 긴 섹션을 읽는 동안 제목이 위로
       * 빠져나가는 순간 아무것도 안 켜져서 깜빡인다. 이 규칙은 들어오고 나가는
       * 순간이 아니라 매 위치에서 평가해야 하므로 IntersectionObserver 대신
       * 스크롤마다 rect를 읽는다 — 제목은 많아야 십수 개라 비용이 안 든다.
       */
      const update = () => {
        const line = window.innerHeight * SPY_LINE;
        const passed = headings.filter(
          (heading) => heading.getBoundingClientRect().top <= line,
        );
        // 마지막 섹션이 짧으면 그 제목은 기준선까지 못 올라온다. 문서 끝에선
        // 마지막 항목을 켠다. 아무 제목도 안 지났으면 첫 항목이다.
        const current = isAtBottom()
          ? headings.at(-1)
          : (passed.at(-1) ?? headings[0]);

        setActiveId(current?.id ?? null);
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      // 스크롤이 멈춘 뒤에 본문 높이가 바뀌면(늦게 뜨는 이미지·폰트 교체 등)
      // 제목 위치가 밀리는데 scroll 이벤트는 오지 않는다. 본문 크기 변화도
      // 위치 재평가의 계기로 삼는다.
      const article = document.querySelector("article");
      const resizeObserver = new ResizeObserver(update);
      if (article) resizeObserver.observe(article);

      return () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        resizeObserver.disconnect();
      };
    };

    const sync = () => {
      cleanup?.();
      cleanup = mql.matches ? attach() : undefined;
      if (!mql.matches) setActiveId(null);
    };

    sync();
    mql.addEventListener("change", sync);

    return () => {
      mql.removeEventListener("change", sync);
      cleanup?.();
    };
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  /*
   * lenis.css가 html.lenis-smooth에 scroll-behavior: auto !important를 걸어
   * 네이티브 앵커 점프가 Lenis 내부 위치와 어긋난다. Lenis에게 맡기고,
   * 인스턴스가 없으면 preventDefault를 하지 않아 네이티브 앵커로 되돌아간다.
   */
  const scrollToHeading = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    const target = document.getElementById(id);
    if (!lenis || !target) return;

    event.preventDefault();
    lenis.scrollTo(target, {
      // 이동 중에 본문 높이가 바뀌면 목적지가 밀린 채 멈춘다. 끝난 뒤 한 번만
      // 다시 재서 어긋났으면 즉시 맞춘다 — 두 번째는 애니메이션 없이.
      onComplete: () => {
        const drift = Math.abs(
          target.getBoundingClientRect().top - HEADING_SCROLL_MARGIN,
        );
        if (drift > 8) lenis.scrollTo(target, { immediate: true });
      },
    });
    // preventDefault로 사라진 해시를 되돌려 준다. push하면 뒤로 가기가 목차
    // 클릭 횟수만큼 쌓인다.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    /*
     * 본문 칼럼(max-w-2xl)을 grid로 바꾸면 (main) 아래 다른 라우트의 정렬이
     * 전부 흔들린다. 더 넓은 중앙 정렬 레일 안에 fixed로 띄워 본문 폭은
     * 건드리지 않는다.
     */
    <aside
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 top-32 z-40 hidden px-6 xl:block"
    >
      <nav className="mx-auto w-full max-w-6xl">
        <ul className="pointer-events-auto max-h-[calc(100vh-16rem)] w-56 overflow-y-auto overscroll-contain text-sm">
          {entries.map(({ id, text }) => {
            const active = id === activeId;

            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(event) => scrollToHeading(event, id)}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    // 목차는 최상위 제목만 받으므로 들여쓰기 단계가 없다
                    "block py-1.5 leading-snug break-keep transition-colors",
                    // 활성은 색만으로 구분한다. 왼쪽 세로선은 목차를 상자처럼
                    // 가둬 보여 뺐다.
                    active
                      ? "text-black dark:text-white"
                      : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white",
                  )}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
