"use client";

import { Popover } from "@base-ui/react/popover";
import { format, isValid, parse } from "date-fns";
import { DayPicker, type ClassNames } from "react-day-picker";
// date-fns의 ko에 DayPicker용 한국어 aria-label까지 얹은 로케일이다. date-fns의
// format에도 그대로 쓸 수 있어 표시 문자열과 캘린더가 같은 로케일을 공유한다.
import { ko } from "react-day-picker/locale";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { CONTROL, POPUP, POSITIONER } from "./ui";

const ISO_DATE = "yyyy-MM-dd";
// app/editor/actions.ts의 assertValidMetadata와 같은 형식을 강제한다 — 여기서
// 통과시킨 문자열이 그대로 MDX 메타데이터로 직렬화된다.
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// new Date("2026-09-09")는 UTC 자정으로 파싱돼 KST에서 하루 당겨진 날짜로
// 보인다. date-fns의 parse/format은 로컬 시간 기준이라 문자열↔Date를 왕복해도
// 날짜가 흔들리지 않는다. 이 파일에서 Date를 만드는 경로는 여기 하나뿐이다.
const parseIsoDate = (value: string): Date | null => {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const parsed = parse(value, ISO_DATE, new Date());
  // 2026-02-31처럼 형식은 맞지만 존재하지 않는 날짜를 걸러낸다.
  return isValid(parsed) ? parsed : null;
};

// react-day-picker 기본 스타일시트(style.css)를 import하지 않는다 — 라이브러리가
// 런타임에 주입하는 CSS는 없고 클래스 이름만 붙이므로, 여기서 전부 덮어쓰면
// 주변 입력 요소와 같은 Tailwind 톤을 유지할 수 있다.
const navButtonClass =
  "flex size-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-black/5 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-200/10";

// selected·today는 날짜 칸(td)에 붙고 눌리는 건 그 안의 button이라, 버튼 쪽에서
// group-data-*로 되짚는다. td에 직접 배경을 주면 hover 클래스가 더 높은
// 명시도로 이겨서 선택된 날이 hover 시 풀려 보인다.
const dayPickerClassNames: Partial<ClassNames> = {
  root: "text-sm text-neutral-700 dark:text-neutral-300",
  months: "flex flex-col",
  month: "grid grid-cols-[auto_1fr_auto] items-center gap-y-2",
  button_previous: navButtonClass,
  button_next: navButtonClass,
  chevron: "size-3.5 fill-current",
  month_caption:
    "text-center text-sm font-medium text-neutral-900 dark:text-white",
  month_grid: "col-span-3 border-collapse",
  weekday:
    "size-8 text-[11px] font-normal text-neutral-400 dark:text-neutral-600",
  day: "group p-0 text-center",
  day_button:
    "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-black/5 group-data-today:font-semibold group-data-today:ring-1 group-data-today:ring-neutral-300 group-data-selected:bg-black group-data-selected:text-white dark:hover:bg-neutral-200/10 dark:group-data-today:ring-neutral-700 dark:group-data-selected:bg-white dark:group-data-selected:text-black",
  hidden: "invisible",
};

export interface DateFieldProps {
  /** yyyy-MM-dd. lib/editor/document.ts의 PostMetadata.publishedAt과 같은 형식 */
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function DateField({ value, onChange, id }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  // 파싱은 렌더 중 계산으로 끝난다 — value를 Date 상태로 복제해두면 호출부가
  // 발행일을 바꿨을 때(글 불러오기 등) 두 값이 어긋난다.
  const selected = parseIsoDate(value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        className={cn(
          CONTROL,
          "flex w-fit items-center gap-2 text-neutral-900 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:text-white dark:hover:bg-neutral-200/10 dark:focus-visible:outline-white",
        )}
      >
        <CalendarIcon />
        <span
          className={cn(!selected && "text-neutral-400 dark:text-neutral-600")}
        >
          {selected
            ? format(selected, "yyyy년 M월 d일 (E)", { locale: ko })
            : "날짜 선택"}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={4} className={POSITIONER}>
          <Popover.Popup className={cn(POPUP, "p-3")}>
            <DayPicker
              mode="single"
              // 발행일은 비울 수 없는 값이다. required면 이미 선택된 날을 다시
              // 눌러도 해제되지 않고 onSelect가 그대로 호출돼 팝오버가 닫힌다.
              required
              selected={selected ?? undefined}
              onSelect={(date) => {
                onChange(format(date, ISO_DATE));
                setOpen(false);
              }}
              // 값이 없거나 형식이 깨졌으면 이번 달을 연다.
              defaultMonth={selected ?? undefined}
              locale={ko}
              navLayout="around"
              classNames={dayPickerClassNames}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-neutral-400 dark:text-neutral-600"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
