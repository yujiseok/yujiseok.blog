import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { JSONContent } from "@tiptap/core";

import { docToMarkdown, markdownToDoc, openForEditing } from "./markdown";

describe("왕복 - doc -> markdown -> doc", () => {
  // 마크는 바깥쪽부터(link > underline > bold > ...) 적는다 — 파싱이 그 순서로 돌려준다
  const text = (value: string, ...marks: string[]): JSONContent =>
    marks.length === 0
      ? { type: "text", text: value }
      : { type: "text", text: value, marks: marks.map((type) => ({ type })) };
  const para = (...content: JSONContent[]): JSONContent => ({
    type: "paragraph",
    content,
  });
  const item = (value: string): JSONContent => ({
    type: "listItem",
    content: [para(text(value))],
  });

  it("모든 블록 종류와 마크가 섞인 문서가 왕복 후에도 마크·속성까지 동일하다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [text("제목")],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [text("소제목")],
        },
        para(
          text("굵게", "bold"),
          text(" "),
          text("기울임", "italic"),
          text(" "),
          text("취소선", "strike"),
          text(" "),
          text("밑줄", "underline"),
          text(" "),
          text("코드", "code"),
          text(" "),
          {
            type: "text",
            text: "링크",
            marks: [{ type: "link", attrs: { href: "/a" } }],
          },
          text(" "),
          text("굵고밑줄", "underline", "bold"),
        ),
        para(text("첫줄"), { type: "hardBreak" }, text("둘째줄")),
        { type: "bulletList", content: [item("항목1"), item("항목2")] },
        { type: "orderedList", content: [item("하나"), item("둘")] },
        { type: "blockquote", content: [para(text("인용"))] },
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [text("const a = 1;")],
        },
        {
          type: "codeBlock",
          attrs: { language: null },
          content: [text("plain")],
        },
        { type: "horizontalRule" },
        {
          type: "image",
          attrs: {
            src: "/a.png",
            alt: "설명",
            title: "제목",
            width: null,
            height: null,
            align: null,
          },
        },
        {
          type: "image",
          attrs: {
            src: "/b.png",
            alt: "잡콕",
            width: 768,
            height: 400,
            align: null,
          },
        },
      ],
    };

    expect(markdownToDoc(docToMarkdown(doc))).toEqual(doc);
  });
});

describe("왕복 - markdown -> doc -> markdown", () => {
  it("직접 작성한 마크다운이 마크 표기까지 그대로 왕복한다", () => {
    const md = [
      "# 제목",
      "",
      "## 소제목",
      "",
      "**굵게** _기울임_ ~~취소선~~ <u>밑줄</u> `코드` [링크](/a) <u>**굵고밑줄**</u>",
      "",
      "첫줄  ",
      "둘째줄",
      "",
      "- 항목1",
      "- 항목2",
      "",
      "1. 하나",
      "2. 둘",
      "",
      "> 인용문",
      "",
      "```ts",
      "const a = 1;",
      "```",
      "",
      "```",
      "plain",
      "```",
      "",
      "---",
      "",
      '![설명](/a.png "제목")',
      "",
      '<Image src="/b.png" alt="잡콕" width={768} height={400} />',
      "",
    ].join("\n");

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });
});

describe("docToMarkdown - 이스케이프", () => {
  it("- 로 시작하는 문단을 이스케이프한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "- 로 시작하는 문단" }],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("\\- 로 시작하는 문단\n");
  });

  it("리터럴 * 를 포함한 텍스트를 이스케이프한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "별표 *별표* 포함" }],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("별표 \\*별표\\* 포함\n");
  });

  it("# 으로 시작하는 문단을 이스케이프한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "# 텍스트" }] },
      ],
    };
    expect(docToMarkdown(doc)).toBe("\\# 텍스트\n");
  });
});

describe("미지의 JSX 블록 보존", () => {
  // mdxBlock 은 에디터가 모르는 JSX 를 원문 그대로 들고 있다가 저장할 때
  // 되돌려 놓는다. 여기가 깨지면 <Callout> 이 든 글을 열었다 저장하는 것만으로
  // 내용이 사라진다.
  it("한 줄·여러 줄 JSX 블록을 mdxBlock 으로 들고 있다가 바이트 단위로 되돌려 쓴다", () => {
    const md =
      '앞 문단\n\n<Callout type="info">내용</Callout>\n\n<Callout>\n  여러 줄에 걸친\n  내용입니다.\n</Callout>\n\n뒷 문단\n';

    const doc = markdownToDoc(md);

    expect(doc.content?.[1]).toEqual({
      type: "mdxBlock",
      attrs: { value: '<Callout type="info">내용</Callout>' },
    });
    expect(doc.content?.[2]).toEqual({
      type: "mdxBlock",
      attrs: {
        value: "<Callout>\n  여러 줄에 걸친\n  내용입니다.\n</Callout>",
      },
    });
    expect(docToMarkdown(doc)).toBe(md);
  });
});

describe("이미지 - JSX <Image>", () => {
  const jsxImage = (attrs: Record<string, unknown>): JSONContent => ({
    type: "doc",
    content: [{ type: "image", attrs }],
  });

  it("속성(align 포함)을 전부 정적으로 읽을 수 있는 <Image> 를 image 노드로 파싱한다", () => {
    const md =
      '<Image src="/a.png" width={768} height={400} alt="잡콕" align="left" />\n';

    expect(markdownToDoc(md)).toEqual(
      jsxImage({
        src: "/a.png",
        alt: "잡콕",
        width: 768,
        height: 400,
        align: "left",
      }),
    );
  });

  it("width/height 가 있으면 <Image> JSX 로, align 이 있으면 문자열 prop 으로 직렬화한다", () => {
    expect(
      docToMarkdown(
        jsxImage({
          src: "/a.png",
          alt: "잡콕",
          width: 768,
          height: 400,
          align: "right",
        }),
      ),
    ).toBe(
      '<Image src="/a.png" alt="잡콕" width={768} height={400} align="right" />\n',
    );
  });

  it("목록 안의 <Image> 도 편집 가능한 노드가 된다", () => {
    const md =
      '- 항목\n\n  <Image src="/a.png" alt="a" width={7} height={8} />\n';

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });

  it.each([
    [
      "해석 못 하는 표현식 속성",
      '<Image src="/a.png" style={{ margin: 0 }} />',
    ],
    ["변수 참조", "<Image src={src} width={768} height={400} />"],
    ["스프레드", '<Image {...props} src="/a.png" />'],
    ["모르는 속성", '<Image src="/a.png" priority className="w-full" />'],
    ["숫자가 아닌 크기", '<Image src="/a.png" width={w * 2} height={400} />'],
  ])("%s 가 섞이면 mdxBlock 으로 남긴다", (_, md) => {
    expect(markdownToDoc(`${md}\n`)).toEqual({
      type: "doc",
      content: [{ type: "mdxBlock", attrs: { value: md } }],
    });
  });
});

describe("문단 정렬 - <div style={{ textAlign }}>", () => {
  const alignDiv = (style: string, inner: string) =>
    `<div style={${style}}>\n  ${inner}\n</div>\n`;

  it.each([
    [
      "가운데 정렬 div 는 문단의 align attr 로",
      '{ textAlign: "center" }',
      "가운데",
      { type: "paragraph", attrs: { align: "center" } },
    ],
    [
      "오른쪽 정렬 div 는 문단의 align attr 로",
      '{ textAlign: "right" }',
      "오른쪽",
      { type: "paragraph", attrs: { align: "right" } },
    ],
    [
      "정렬 div 안의 제목도 정렬 대상으로",
      '{ textAlign: "center" }',
      "## 제목",
      { type: "heading", attrs: { level: 2, align: "center" } },
    ],
    // 왼쪽은 렌더 기본이라 attr 을 남길 이유가 없다. div 만 사라진다.
    [
      "textAlign: left 는 align 없는 문단으로",
      '{ textAlign: "left" }',
      "왼쪽",
      { type: "paragraph" },
    ],
  ])("%s 읽는다", (_name, style, inner, node) => {
    const expectedText = inner.replace(/^## /, "");
    expect(markdownToDoc(alignDiv(style, inner))).toEqual({
      type: "doc",
      content: [{ ...node, content: [{ type: "text", text: expectedText }] }],
    });
  });

  it.each([
    [
      "className 동반",
      '<div className="flex" style={{ textAlign: "center" }}>\n  본문\n</div>',
    ],
    [
      "속성 2개짜리 style",
      '<div style={{ textAlign: "center", color: "red" }}>\n  본문\n</div>',
    ],
    [
      "자식이 <Image>",
      '<div style={{ textAlign: "center" }}>\n  <Image src="/a.png" width={7} height={8} />\n</div>',
    ],
    ["변수 표현식", "<div style={{ textAlign: align }}>\n  본문\n</div>"],
    [
      "자식 2개",
      '<div style={{ textAlign: "center" }}>\n  첫째\n\n  둘째\n</div>',
    ],
  ])("%s 는 승격하지 않고 mdxBlock 으로 남긴다", (_, md) => {
    expect(markdownToDoc(`${md}\n`)).toEqual({
      type: "doc",
      content: [{ type: "mdxBlock", attrs: { value: md } }],
    });
  });

  it("align 이 붙은 문단·제목을 div 로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: { align: "center" },
          content: [{ type: "text", text: "가운데" }],
        },
        {
          type: "heading",
          attrs: { level: 2, align: "right" },
          content: [{ type: "text", text: "오른쪽 제목" }],
        },
      ],
    };

    expect(docToMarkdown(doc)).toBe(
      '<div style={{ textAlign: "center" }}>\n  가운데\n</div>\n\n' +
        '<div style={{ textAlign: "right" }}>\n  ## 오른쪽 제목\n</div>\n',
    );
  });

  it("align 이 null 이거나 left 면 감싸지 않는다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: { align: null },
          content: [{ type: "text", text: "기본" }],
        },
        {
          type: "paragraph",
          attrs: { align: "left" },
          content: [{ type: "text", text: "왼쪽" }],
        },
      ],
    };

    expect(docToMarkdown(doc)).toBe("기본\n\n왼쪽\n");
  });

  it("목록 안 문단의 align 은 무시한다", () => {
    // `- <div ...>` 가 되면 마크다운이 깨진다. 정렬은 최상위에서만 씌운다.
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: { align: "center" },
                  content: [{ type: "text", text: "항목" }],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(docToMarkdown(doc)).toBe("- 항목\n");
  });

  it("정렬 div 가 왕복해도 그대로다", () => {
    const md = '<div style={{ textAlign: "center" }}>\n  가운데\n</div>\n';

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });
});

describe("표 - GFM 파이프 표", () => {
  // 셀은 어디서나 같은 모양이라(정렬 attr + 문단 하나) 기대값을 한 곳에서 짓는다
  const cell = (
    type: "tableHeader" | "tableCell",
    align: "left" | "center" | "right" | null,
    text: string,
  ) =>
    ({
      type,
      attrs: { align },
      ...(text === ""
        ? {}
        : {
            content: [{ type: "paragraph", content: [{ type: "text", text }] }],
          }),
    }) as JSONContent;

  it("헤더 한 줄과 본문 두 줄을 읽고 파이프 표기로 되돌려 쓴다", () => {
    const md = [
      "| 이름 | 값 |",
      "| - | - |",
      "| a | 1 |",
      "| b | 2 |",
      "",
    ].join("\n");

    const doc = markdownToDoc(md);

    expect(docToMarkdown(doc)).toBe(md);
    expect(doc).toEqual({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                cell("tableHeader", null, "이름"),
                cell("tableHeader", null, "값"),
              ],
            },
            {
              type: "tableRow",
              content: [
                cell("tableCell", null, "a"),
                cell("tableCell", null, "1"),
              ],
            },
            {
              type: "tableRow",
              content: [
                cell("tableCell", null, "b"),
                cell("tableCell", null, "2"),
              ],
            },
          ],
        },
      ],
    });
  });

  it("열 정렬을 셀 attr 로 읽고 구분선으로 되돌려 쓴다", () => {
    const md = [
      "| 왼 | 가운데 | 오른 |",
      "| :- | :-: | -: |",
      "| a | b | c |",
      "",
    ].join("\n");
    const doc = markdownToDoc(md);

    // 정렬은 mdast 에서 열 단위지만 Tiptap 에는 열 노드가 없다 — 셀마다 실린다.
    expect(doc.content?.[0].content?.[1].content).toEqual([
      cell("tableCell", "left", "a"),
      cell("tableCell", "center", "b"),
      cell("tableCell", "right", "c"),
    ]);
    expect(docToMarkdown(doc)).toBe(md);
  });

  it("셀 안의 파이프 문자를 이스케이프해 왕복시킨다", () => {
    const md = ["| 표기 | 뜻 |", "| - | - |", "| a \\| b | 또는 |", ""].join(
      "\n",
    );
    const doc = markdownToDoc(md);

    // 읽을 때는 이스케이프가 풀린 글자 그대로여야 한다. 그대로 두면 편집 중
    // 백슬래시가 본문에 보이고, 저장 때 한 번 더 이스케이프된다.
    expect(doc.content?.[0].content?.[1].content?.[0]).toEqual(
      cell("tableCell", null, "a | b"),
    );
    expect(docToMarkdown(doc)).toBe(md);
  });

  it("빈 셀은 내용 없는 문단 하나로 읽고 빈 칸으로 되돌려 쓴다", () => {
    const md = ["| 이름 | 값 |", "| - | - |", "| a | |", ""].join("\n");
    const doc = markdownToDoc(md);

    expect(doc.content?.[0].content?.[1].content?.[1]).toEqual({
      type: "tableCell",
      attrs: { align: null },
      content: [{ type: "paragraph" }],
    });
    expect(docToMarkdown(doc)).toBe(md);
  });

  it("JSX <table> 은 승격하지 않고 mdxBlock 으로 남긴다", () => {
    // 파이프 표만 편집 대상이다. JSX 표는 속성·중첩 컴포넌트를 담을 수 있어
    // 파이프 표기로 옮기면 원문이 깎인다.
    const md =
      "<table>\n  <tbody>\n    <tr>\n      <td>a</td>\n    </tr>\n  </tbody>\n</table>";

    expect(markdownToDoc(`${md}\n`)).toEqual({
      type: "doc",
      content: [{ type: "mdxBlock", attrs: { value: md } }],
    });
    expect(docToMarkdown(markdownToDoc(`${md}\n`))).toBe(`${md}\n`);
  });
});

describe("접기 - <details>", () => {
  const details = (summary: string, body: string) =>
    `<details>\n  <summary>${summary}</summary>\n\n  ${body}\n</details>\n`;

  const detailsNode = (
    summary: JSONContent[],
    body: JSONContent[],
    open = false,
  ): JSONContent => ({
    type: "details",
    attrs: { open },
    content: [
      { type: "detailsSummary", content: summary },
      { type: "detailsContent", content: body },
    ],
  });

  it("<summary> 와 본문을 details 노드로 읽는다", () => {
    expect(markdownToDoc(details("제목", "본문"))).toEqual({
      type: "doc",
      content: [
        detailsNode(
          [{ type: "text", text: "제목" }],
          [{ type: "paragraph", content: [{ type: "text", text: "본문" }] }],
        ),
      ],
    });
  });

  it("본문에 코드블록 같은 블록이 여러 개 있어도 전부 담는다", () => {
    const md =
      "<details>\n  <summary>코드</summary>\n\n  설명\n\n  ```ts\n  const a = 1;\n  ```\n</details>\n";

    expect(markdownToDoc(md).content?.[0]).toEqual(
      detailsNode(
        [{ type: "text", text: "코드" }],
        [
          { type: "paragraph", content: [{ type: "text", text: "설명" }] },
          {
            type: "codeBlock",
            attrs: { language: "ts" },
            content: [{ type: "text", text: "const a = 1;" }],
          },
        ],
      ),
    );
  });

  it.each([
    ["<details open>", true],
    ["<details open={true}>", true],
    ["<details open={false}>", false],
  ])("%s 의 열림 상태를 읽는다", (tag, open) => {
    const md = `${tag}\n  <summary>제목</summary>\n\n  본문\n</details>\n`;

    expect(markdownToDoc(md).content?.[0]).toEqual(
      detailsNode(
        [{ type: "text", text: "제목" }],
        [{ type: "paragraph", content: [{ type: "text", text: "본문" }] }],
        open,
      ),
    );
  });

  it.each([
    // 닫힘이 <details> 의 렌더 기본이라 open={false} 를 적으면 원문에 없던
    // 속성이 생긴다.
    ["닫힌 상태는 속성 없이", "<details>"],
    ["열린 상태는 JSX 불리언 단축으로", "<details open>"],
  ])("%s 쓴다", (_name, tag) => {
    const md = `${tag}\n  <summary>제목</summary>\n\n  본문\n</details>\n`;

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });

  it("빈 요약도 왕복한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "details",
          attrs: { open: false },
          content: [
            { type: "detailsSummary" },
            {
              type: "detailsContent",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "본문" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const md = docToMarkdown(doc);
    expect(md).toBe("<details>\n  <summary />\n\n  본문\n</details>\n");
    expect(markdownToDoc(md)).toEqual(doc);
  });

  it("중첩된 접기도 왕복한다", () => {
    const md =
      "<details>\n  <summary>바깥</summary>\n\n  <details>\n    <summary>안쪽</summary>\n\n    본문\n  </details>\n</details>\n";

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });

  it.each([
    [
      "모르는 속성",
      '<details className="x">\n  <summary>a</summary>\n\n  b\n</details>',
    ],
    [
      "open 이 문자열",
      '<details open="true">\n  <summary>a</summary>\n\n  b\n</details>',
    ],
    [
      "open 이 변수",
      "<details open={isOpen}>\n  <summary>a</summary>\n\n  b\n</details>",
    ],
    [
      "속성이 둘",
      '<details open id="a">\n  <summary>a</summary>\n\n  b\n</details>',
    ],
    [
      "요약에 속성",
      '<details>\n  <summary className="x">a</summary>\n\n  b\n</details>',
    ],
    ["요약이 없음", "<details>\n  본문만 있습니다.\n</details>"],
    [
      "요약이 첫 자식이 아님",
      "<details>\n  앞 문단\n\n  <summary>a</summary>\n\n  b\n</details>",
    ],
    [
      "요약에 이미지",
      "<details>\n  <summary>![a](/a.png)</summary>\n\n  b\n</details>",
    ],
    [
      "요약이 블록 요소",
      "<details>\n  <summary>\n    a\n  </summary>\n\n  b\n</details>",
    ],
    ["본문이 없음", "<details>\n  <summary>a</summary>\n</details>"],
  ])("%s 이면 승격하지 않고 mdxBlock 으로 남긴다", (_, md) => {
    expect(markdownToDoc(`${md}\n`)).toEqual({
      type: "doc",
      content: [{ type: "mdxBlock", attrs: { value: md } }],
    });
    expect(docToMarkdown(markdownToDoc(`${md}\n`))).toBe(`${md}\n`);
  });

  it("기존 글의 들여쓰기가 제각각이어도 내용은 보존된다", () => {
    // 저장 시 <details> 안쪽 들여쓰기는 2칸으로 정규화된다. 표기만 달라지고
    // 코드펜스 안 내용은 그대로라 lossless 다.
    const md =
      "<details>\n<summary>제목</summary>\n\n```ts\nconst a = 1;\n```\n\n</details>\n";
    const opened = openForEditing(md);

    expect(opened.lossless).toBe(true);
    expect(docToMarkdown(opened.doc)).toBe(
      "<details>\n  <summary>제목</summary>\n\n  ```ts\n  const a = 1;\n  ```\n</details>\n",
    );
  });
});
