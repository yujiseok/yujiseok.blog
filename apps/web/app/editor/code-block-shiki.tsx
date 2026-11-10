"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { EditorSelect } from "./select";
import { FIELD } from "./ui";
import { findChildren } from "@tiptap/core";
import { CodeBlock } from "@tiptap/extension-code-block";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import {
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
} from "shiki";
import type { SpecialLanguage } from "shiki/types";

/*
 * StarterKit의 codeBlock은 <pre><code>만 만들고 토큰화를 하지 않아 에디터
 * 안에서만 코드가 흑백이다. 발행된 글은 next.config.ts의 rehype-pretty-code가
 * shiki로 칠하므로, 같은 테마를 그대로 써서 편집 화면과 결과물의 색을 맞춘다.
 *
 * 하이라이트는 전부 ProseMirror 데코레이션으로만 얹는다. 이 에디터의 존재
 * 이유가 MDX 원문 왕복 무손실이라, 노드 내용이나 attrs에 하이라이트 흔적이
 * 남으면 저장하는 순간 원문이 깨진다.
 */

// next.config.ts의 rehype-pretty-code와 반드시 같은 값이어야 한다.
const THEME = "poimandres";

// 코드펜스에 실제로 쓰는 언어만 노출한다. shiki 번들 전체를 나열해도
// 고를 일이 없고, 목록에 없는 언어(기존 글의 python 등)는 선택기에 안 보일
// 뿐 attr에 남아 있는 한 그대로 하이라이트된다.
const LANGUAGE_VALUES = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "bash",
  "sh",
  "yaml",
  "xml",
  "html",
  "css",
  "md",
  "mdx",
  "txt",
  "diff",
] as const satisfies readonly (BundledLanguage | SpecialLanguage)[];

// language attr의 null("코드펜스에 언어가 없다")과 base-ui Select가 선택 해제에
// 쓰는 null이 겹치면 구분할 수 없다. UI에서만 문자열 sentinel을 쓰고 attr에
// 넣을 때 다시 null로 되돌린다.
const NO_LANGUAGE = "none";

const LANGUAGE_OPTIONS = [
  { value: NO_LANGUAGE, label: "언어 없음" },
  // 라벨을 펜스 토큰 그대로 둔다 — 고른 값이 파일에 그대로 적히는 게 보여야 한다.
  ...LANGUAGE_VALUES.map((value) => ({ value, label: value })),
];

/*
 * shiki 하이라이터는 wasm 로딩을 동반해 무겁다. 모듈 레벨 싱글턴으로 한 번만
 * 만들고, 언어는 문서에 실제로 등장한 것만 지연 로딩한다.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = () =>
  (highlighterPromise ??= createHighlighter({ themes: [THEME], langs: [] }));

/*
 * 데코레이션 계산은 트랜잭션 안에서 동기로 끝나야 해서 await할 수 없다. 준비된
 * 하이라이터와 언어를 따로 들고 있다가, 있으면 칠하고 없으면 이번 렌더는 평문으로
 * 두고 로딩만 건다. 로딩이 끝나면 refresh가 빈 트랜잭션으로 다시 칠하게 한다.
 */
let readyHighlighter: Highlighter | null = null;
// shiki가 별칭(sh→shellscript)을 해석해 버려서 getLoadedLanguages()로는 우리가
// 넘긴 문자열이 준비됐는지 알 수 없다. 요청한 문자열 그대로 기억한다.
const readyLanguages = new Set<string>();
const requestedLanguages = new Set<string>();

// 문서의 language attr은 MDX 원문에서 온 임의 문자열이라 shiki의 리터럴 유니온으로
// 좁힐 방법이 없다. 지원 여부는 loadLanguage 성공으로만 알 수 있어서 여기서만
// 캐스팅하고, 실패는 requestLanguage가 삼킨다.
const asBundledLanguage = (language: string) => language as BundledLanguage;

const requestLanguage = (language: string, onReady: () => void) => {
  if (requestedLanguages.has(language)) return;
  requestedLanguages.add(language);

  getHighlighter()
    .then(async (highlighter) => {
      await highlighter.loadLanguage(asBundledLanguage(language));
      readyHighlighter = highlighter;
      readyLanguages.add(language);
      onReady();
    })
    .catch(() => {
      // shiki가 모르는 언어(오타, 사설 펜스)는 평문으로 둔다. 에디터를 못 쓰게
      // 만들 이유가 없고, requestedLanguages에 남아 재시도도 하지 않는다.
    });
};

// @shikijs/vscode-textmate의 FontStyle 비트 플래그. shiki 루트가 값으로
// export하지 않아 여기 상수로 둔다.
const FONT_STYLE_RULES = [
  { flag: 1, css: "font-style:italic" },
  { flag: 2, css: "font-weight:bold" },
  { flag: 4, css: "text-decoration:underline" },
  { flag: 8, css: "text-decoration:line-through" },
];

const tokenStyle = ({
  color,
  fontStyle,
}: {
  color?: string;
  fontStyle?: number;
}): string =>
  [
    color ? `color:${color}` : null,
    ...FONT_STYLE_RULES.filter(
      ({ flag }) => ((fontStyle ?? 0) & flag) !== 0,
    ).map(({ css }) => css),
  ]
    .filter((rule) => rule !== null)
    .join(";");

const readLanguage = (attrs: Record<string, unknown>): string | null =>
  typeof attrs.language === "string" ? attrs.language : null;

const readMeta = (attrs: Record<string, unknown>): string | null =>
  typeof attrs.meta === "string" ? attrs.meta : null;

/*
 * meta는 코드펜스 뒤에 붙는 조각들의 나열이라 title 말고도 {8}, {2, 5} 같은 줄
 * 하이라이트가 함께 온다. 제목만 갈아끼우고 나머지는 원문 그대로 둬야 발행 결과가
 * 안 바뀌므로, 읽기와 쓰기를 이 두 순수 함수에만 가둔다.
 *
 * | meta                | title      | writeTitle 결과       |
 * | ------------------- | ---------- | --------------------- |
 * | `title="a.ts" {8}`  | `b.ts`     | `title="b.ts" {8}`    |
 * | `title="a.ts" {8}`  | `` (빈값) | `{8}`                 |
 * | `null`              | `a.ts`     | `title="a.ts"`        |
 * | `{8}`               | `a.ts`     | `title="a.ts" {8}`    |
 * | `title="a.ts"`      | `` (빈값) | `null`                |
 * | `{8}`               | `` (빈값) | `{8}`                 |
 * | `null`              | `a"b.ts`   | `title="ab.ts"`       |
 */
const TITLE_PATTERN = /title="([^"]*)"/;

const readTitle = (meta: string | null): string =>
  meta?.match(TITLE_PATTERN)?.[1] ?? "";

const writeTitle = (meta: string | null, title: string): string | null => {
  // rehype-pretty-code의 meta 파서에 이스케이프가 없어서, 값 안의 큰따옴표는
  // 닫는 따옴표로 읽혀 meta 전체를 깨뜨린다. 저장 전에 떨어뜨린다.
  const safe = title.replaceAll('"', "").trim();
  const fragment = safe ? `title="${safe}"` : "";
  const current = meta ?? "";
  const next = TITLE_PATTERN.test(current)
    ? // 치환값을 함수로 넘겨 제목 속 $&, $1이 치환 패턴으로 해석되지 않게 한다.
      current.replace(TITLE_PATTERN, () => fragment)
    : [fragment, current].filter(Boolean).join(" ");
  // 조각을 빼고 남은 공백을 정리한다. 남는 게 없으면 attr은 null이어야 한다.
  const normalized = next.replace(/\s+/g, " ").trim();

  return normalized === "" ? null : normalized;
};

const decorateCodeBlock = (
  node: ProseMirrorNode,
  pos: number,
  onLanguageNeeded: (language: string) => void,
): Decoration[] => {
  const language = readLanguage(node.attrs);
  if (!language) return [];

  if (!readyHighlighter || !readyLanguages.has(language)) {
    onLanguageNeeded(language);
    return [];
  }

  // 텍스트는 노드 시작 바로 다음 위치부터다.
  const from = pos + 1;

  return (
    readyHighlighter
      .codeToTokens(node.textContent, {
        lang: asBundledLanguage(language),
        theme: THEME,
      })
      .tokens.flat()
      // ThemedToken.offset이 코드 전체 기준 0-index라 줄·토큰 오프셋을 직접
      // 누적할 필요가 없다.
      .flatMap((token) => {
        const style = tokenStyle(token);
        if (!style || token.content.length === 0) return [];
        return Decoration.inline(
          from + token.offset,
          from + token.offset + token.content.length,
          { style },
        );
      })
  );
};

const shikiPluginKey = new PluginKey<DecorationSet>("code-block-shiki");

export const CodeBlockShiki = CodeBlock.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      /*
       * ```ts title="next.config.ts" {8} 의 meta. lib/editor/markdown.ts가
       * 이 attr로 읽고 쓰는데 스키마에 없으면 setContent 단계에서 조용히
       * 사라져, 열었다 저장하기만 해도 코드블록 제목이 날아간다. 노드뷰의 제목
       * 입력칸이 이 중 title="..." 조각만 편집하고 나머지는 원문대로 보존한다.
       */
      meta: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-meta"),
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.meta ? { "data-meta": attributes.meta } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  addProseMirrorPlugins() {
    const { editor, name } = this;

    // 하이라이터가 준비되면 빈 트랜잭션으로 데코레이션만 다시 계산시킨다.
    // 문서를 건드리지 않아야 원문 왕복이 깨지지 않는다.
    const refresh = () => {
      if (editor.isDestroyed) return;
      editor.view.dispatch(
        editor.view.state.tr.setMeta(shikiPluginKey, "refresh"),
      );
    };

    const build = (doc: ProseMirrorNode) =>
      DecorationSet.create(
        doc,
        findChildren(doc, (node) => node.type.name === name).flatMap(
          ({ node, pos }) =>
            decorateCodeBlock(node, pos, (language) =>
              requestLanguage(language, refresh),
            ),
        ),
      );

    return [
      // 부모의 플러그인(VS Code 코드 붙여넣기 처리 등)을 잃지 않는다.
      ...(this.parent?.() ?? []),
      new Plugin<DecorationSet>({
        key: shikiPluginKey,
        state: {
          init: (_, state) => build(state.doc),
          // 커서 이동만으로 문서의 모든 코드블록을 다시 토큰화하지 않는다.
          apply: (tr, previous, _oldState, newState) =>
            tr.docChanged || tr.getMeta(shikiPluginKey)
              ? build(newState.doc)
              : previous,
        },
        props: {
          decorations: (state) => shikiPluginKey.getState(state),
        },
      }),
    ];
  },
});

// 어두운 pre 배경 위에 얹히므로 크기·글자색만 뒤집어 쓴다. 나머지 생김새와
// 동작은 툴바 드롭다운과 같은 EditorSelect가 들고 있다.
const triggerClass =
  "h-6 min-w-16 font-mono text-[11px] text-neutral-300 hover:bg-white/10";
const itemClass = "font-mono text-xs";
// FIELD를 코드블록 리듬(h-6)과 어두운 배경에 맞춰 덮어쓴다.
const titleInputClass = cn(
  FIELD,
  "h-6 w-40 rounded-md border-white/15 bg-transparent px-2 font-mono text-[11px] text-neutral-300 placeholder:text-neutral-500 focus:border-white/35 dark:border-white/15",
);

function CodeBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const language = readLanguage(node.attrs);
  const value = language ?? NO_LANGUAGE;

  const meta = readMeta(node.attrs);
  const title = readTitle(meta);
  // 타이핑마다 트랜잭션을 날리면 undo가 글자 단위로 쪼개진다. 초안은 로컬에 두고
  // blur/Enter에서 한 번만 커밋한다.
  const [draft, setDraft] = useState(title);
  const [committed, setCommitted] = useState(title);

  // undo나 다른 곳의 편집으로 meta가 바뀌면 입력칸도 따라가야 한다. 렌더 중
  // 조정이라 effect 한 번 더 도는 일이 없다.
  if (committed !== title) {
    setCommitted(title);
    setDraft(title);
  }

  // Escape는 되돌리기지만 곧바로 blur가 따라온다. 그 시점의 draft는 아직
  // 되돌리기 전 값이라(setDraft는 다음 렌더에 반영된다) 그대로 두면 취소가
  // 저장이 된다. 이어지는 커밋 한 번만 건너뛰라고 표시한다.
  const cancelling = useRef(false);

  const commitTitle = () => {
    const nextMeta = writeTitle(meta, draft);
    // 저장된 값과 보이는 값이 어긋나면 안 된다. 따옴표 제거·trim 결과를 되돌린다.
    const stored = readTitle(nextMeta);
    setDraft(stored);
    setCommitted(stored);
    if (nextMeta !== meta) updateAttributes({ meta: nextMeta });
  };

  const handleTitleBlur = () => {
    if (cancelling.current) {
      cancelling.current = false;
      return;
    }
    commitTitle();
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // 입력칸의 Backspace·화살표가 ProseMirror까지 올라가면 코드블록이 지워진다.
    event.stopPropagation();

    if (event.key === "Enter") {
      event.preventDefault();
      commitTitle();
      return;
    }

    if (event.key === "Escape") {
      cancelling.current = true;
      setDraft(title);
      event.currentTarget.blur();
    }
  };

  return (
    <NodeViewWrapper className="relative">
      <div
        className="absolute top-2 right-2 z-10 flex items-center gap-1"
        contentEditable={false}
      >
        <input
          aria-label="코드블록 제목"
          placeholder="파일명 (선택)"
          className={titleInputClass}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleTitleKeyDown}
          onBlur={handleTitleBlur}
        />

        <EditorSelect
          label="코드 언어"
          options={LANGUAGE_OPTIONS}
          value={value}
          onChange={(next) =>
            // updateAttributes는 병합이라 meta는 그대로 남는다.
            updateAttributes({
              language: next === NO_LANGUAGE ? null : next,
            })
          }
          triggerClassName={triggerClass}
          itemClassName={itemClass}
        />
      </div>

      <pre>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
