"use client";

import { Select } from "@base-ui/react/select";
import type { ReactElement } from "react";

import { cn } from "@/lib/cn";
import { CaretDownIcon, CheckIcon } from "./icons";
import { ICON_BUTTON, MENU_ITEM, POPUP, POSITIONER } from "./ui";

/*
 * 툴바(블록 종류·목록)와 코드블록(언어)이 같은 드롭다운을 쓴다. 렌더 트리를
 * 각자 들고 있으면 팝업 위치나 선택 표시 같은 결정이 한쪽에서만 바뀐다.
 * 특히 "같은 값을 다시 고르면 무시한다"는 가드는 여기 쓰이는 명령이 전부
 * 토글이라 빠뜨리면 곧바로 버그가 되므로 컴포넌트 안에 가둔다.
 */

export interface SelectOption<Value extends string> {
  value: Value;
  label: string;
}

interface EditorSelectProps<Value extends string> {
  label: string;
  options: SelectOption<Value>[];
  value: Value;
  disabled?: boolean;
  onChange: (value: Value) => void;
  /**
   * 트리거를 대신 렌더할 요소. 툴바는 Toolbar.Button을 넘겨 방향키 이동을
   * 유지한다 — Toolbar 파트는 Toolbar.Root 밖에서 쓸 수 없어 기본값이 없다.
   */
  trigger?: ReactElement;
  /** 자리마다 다른 건 크기와 색뿐이다(코드블록은 어두운 pre 위에 얹힌다) */
  triggerClassName?: string;
  itemClassName?: string;
  /**
   * 기본값(true)은 네이티브 select처럼 선택된 항목을 트리거 위에 포개 띄운다.
   * 툴바는 sticky라 그러면 툴바 자신을 가리므로 false로 아래에 떨어뜨린다.
   */
  alignItemWithTrigger?: boolean;
}

export function EditorSelect<Value extends string>({
  label,
  options,
  value,
  disabled = false,
  onChange,
  trigger,
  triggerClassName,
  itemClassName,
  alignItemWithTrigger = true,
}: EditorSelectProps<Value>) {
  const handleValueChange = (next: Value | null) => {
    // null은 base-ui의 선택 해제 신호다. 값이 아니므로 무시한다. 이미 선택된
    // 값을 다시 고르는 것도 마찬가지 — toggleHeading 같은 토글이 한 번 더
    // 돌면 오히려 꺼져버린다.
    if (next === null || next === value) return;
    onChange(next);
  };

  return (
    <Select.Root
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        render={trigger}
        aria-label={label}
        disabled={disabled}
        className={cn(ICON_BUTTON, "justify-between gap-1", triggerClassName)}
      >
        <Select.Value className="truncate">
          {() =>
            // 목록에 없는 값(기존 글의 python 같은 펜스 언어)도 그대로 보여준다
            options.find((option) => option.value === value)?.label ?? value
          }
        </Select.Value>
        {/* 색을 따로 정하지 않고 트리거의 글자색을 흐리게 쓴다 — 밝은 툴바와
            어두운 코드블록 어느 쪽에 놓여도 대비가 유지된다. */}
        <Select.Icon className="opacity-60">
          <CaretDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          alignItemWithTrigger={alignItemWithTrigger}
          sideOffset={4}
          className={POSITIONER}
        >
          <Select.Popup
            className={cn(
              POPUP,
              "min-w-[var(--anchor-width)] overflow-hidden p-1",
            )}
          >
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={cn(MENU_ITEM, itemClassName)}
                >
                  <Select.ItemIndicator className="flex w-3.5 shrink-0 items-center text-neutral-900 dark:text-white">
                    <CheckIcon />
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
