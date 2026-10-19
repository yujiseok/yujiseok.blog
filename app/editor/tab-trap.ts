import { Extension } from "@tiptap/core";

import { indentIntoPreviousList } from "@/lib/editor/list-indent";

/*
 * Tab은 코드블록(들여쓰기)·목록(sink/lift)·표(셀 이동)가 각자 처리하고,
 * 할 일이 없으면 false를 돌려 브라우저로 넘긴다. 그러면 포커스가 상단
 * 입력칸으로 튄다 — 일반 문단이나 첫 번째 불릿에서 Tab을 누를 때마다.
 *
 * 우선순위를 가장 낮게 둬 위 핸들러가 모두 지나간 뒤에만 받는다.
 * 0은 안 된다 — Tiptap이 `priority || 100`으로 읽어 기본값이 돼 버린다.
 * 남은 경우 중 목록 바로 뒤 목록의 첫 항목만 들여쓰고(list-indent.ts),
 * 나머지는 키를 삼키기만 한다. 문단 들여쓰기를 따로 만들지 않는 건 MDX가
 * 문단 앞 공백을 버려 저장하면 사라지기 때문이다.
 */
export const TabTrap = Extension.create({
  name: "tabTrap",
  priority: 1,

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        editor.commands.command(({ state, dispatch }) =>
          indentIntoPreviousList(state, dispatch),
        );
        return true;
      },
      "Shift-Tab": () => true,
    };
  },
});
