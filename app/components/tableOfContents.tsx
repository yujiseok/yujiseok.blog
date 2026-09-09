"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/cn";
import type { TocEntry } from "@/lib/toc";

// 고정 헤더는 없다. 제목이 뷰포트 맨 위에 딱 붙지 않을 만큼만 띄운다.
// article의 scroll-mt와 같은 값이어야 클릭 이동과 해시 이동이 같은 자리에 선다.
const SCROLL_OFFSET = -32;

// 뷰포트 상단 30% 밴드. 여기 들어온 마지막 heading을 읽는 중으로 본다.
const SPY_ROOT_MARGIN = "0px 0px -70% 0px";

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

    // IntersectionObserver는 밴드에 "들어오고 나간" 순간만 알려주므로 현재
    // 밴드 안에 있는 id를 따로 들고 있어야 한다.
    const inBand = new Set<string>();

    const update = () => {
      const last = entries.findLast(({ id }) => inBand.has(id));

      /*
       * 마지막 섹션이 짧으면 그 heading은 상단 밴드까지 올라오지 못한다.
       * 그대로 두면 문서 끝까지 읽어도 직전 항목이 켜져 있어 위치가 어긋난다.
       */
      setActiveId(
        isAtBottom() ? (entries.at(-1)?.id ?? null) : (last?.id ?? null),
      );
    };

    const observer = new IntersectionObserver(
      (records) => {
        records.forEach((record) => {
          if (record.isIntersecting) inBand.add(record.target.id);
          else inBand.delete(record.target.id);
        });

        update();
      },
      { rootMargin: SPY_ROOT_MARGIN },
    );

    headings.forEach((heading) => observer.observe(heading));
    // 바닥 판정만을 위한 구독. setState는 값이 같으면 리렌더 없이 빠진다.
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
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
