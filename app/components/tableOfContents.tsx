"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/cn";
import type { TocEntry } from "@/lib/toc";

// 고정 헤더는 없다. 제목이 뷰포트 맨 위에 딱 붙지 않을 만큼만 띄운다.
// article의 scroll-mt와 같은 값이어야 클릭 이동과 해시 이동이 같은 자리에 선다.
const SCROLL_OFFSET = -32;

// 이 비율 위로 올라간 제목을 "지나갔다"고 본다
const SPY_LINE = 0.3;

const isAtBottom = () =>
  window.innerHeight + window.scrollY >=
  document.documentElement.scrollHeight - 4;

export const TableOfContents = ({ entries }: { entries: TocEntry[] }) => {
  const lenis = useLenis();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
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

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
    lenis.scrollTo(target, { offset: SCROLL_OFFSET });
    // preventDefault로 사라진 해시를 되돌려 준다. push하면 뒤로 가기가 목차
    // 클릭 횟수만큼 쌓인다.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    /*
     * 본문 칼럼(max-w-2xl)을 grid로 바꾸면 (main) 아래 다른 라우트의 정렬이
     * 전부 흔들린다. fixedBackLink.tsx와 같은 기법 — 더 넓은 중앙 정렬 레일
     * 안에 fixed로 띄워 본문 폭은 건드리지 않는다.
     */
    <aside
      aria-label="목차"
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
                    "block border-l py-1.5 pl-4 leading-snug break-keep transition-colors",
                    active
                      ? "border-black text-black dark:border-white dark:text-white"
                      : "border-neutral-200 text-neutral-500 hover:text-black dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white",
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

export default TableOfContents;
