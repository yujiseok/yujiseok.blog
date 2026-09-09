import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { JSONContent } from "@tiptap/core";

import { docToMarkdown, markdownToDoc } from "./markdown";

describe("docToMarkdown - 블록", () => {
  it("paragraph 를 문단으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "본문" }] },
      ],
    };
    expect(docToMarkdown(doc)).toBe("본문\n");
  });

  it("heading 을 level 만큼의 # 으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "h1" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "h2" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "h3" }],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("# h1\n\n## h2\n\n### h3\n");
  });

  it("bulletList 를 - 목록으로 직렬화한다", () => {
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
                  content: [{ type: "text", text: "항목1" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "항목2" }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("- 항목1\n- 항목2\n");
  });

  it("orderedList 를 숫자 목록으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "하나" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "둘" }] },
              ],
            },
          ],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("1. 하나\n2. 둘\n");
  });

  it("blockquote 를 > 인용으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "인용문" }] },
          ],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("> 인용문\n");
  });

  it("codeBlock 을 언어와 함께 펜스로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [{ type: "text", text: "const a = 1;" }],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("```ts\nconst a = 1;\n```\n");
  });

  it("codeBlock 언어가 없으면 language 를 null 로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: null },
          content: [{ type: "text", text: "plain" }],
        },
      ],
    };
    expect(docToMarkdown(doc)).toBe("```\nplain\n```\n");
  });

  it("horizontalRule 을 구분선으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [{ type: "horizontalRule" }],
    };
    expect(docToMarkdown(doc)).toBe("---\n");
  });

  it("image 를 마크다운 이미지 문법으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        { type: "image", attrs: { src: "/a.png", alt: "설명", title: "제목" } },
      ],
    };
    expect(docToMarkdown(doc)).toBe('![설명](/a.png "제목")\n');
  });

  it("hardBreak 를 줄바꿈으로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "첫줄" },
            { type: "hardBreak" },
            { type: "text", text: "둘째줄" },
          ],
        },
      ],
    };
    // 이 저장소의 기존 글은 줄 끝 백슬래시가 아니라 공백 두 칸을 쓴다
    expect(docToMarkdown(doc)).toBe("첫줄  \n둘째줄\n");
  });
});

describe("docToMarkdown - 마크", () => {
  const wrap = (content: JSONContent[]): JSONContent => ({
    type: "doc",
    content: [{ type: "paragraph", content }],
  });

  it("bold 를 ** 로 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([{ type: "text", text: "굵게", marks: [{ type: "bold" }] }]),
      ),
    ).toBe("**굵게**\n");
  });

  it("italic 을 _ 로 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([{ type: "text", text: "기울임", marks: [{ type: "italic" }] }]),
      ),
    ).toBe("_기울임_\n");
  });

  it("strike 를 ~~ 로 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([{ type: "text", text: "취소선", marks: [{ type: "strike" }] }]),
      ),
    ).toBe("~~취소선~~\n");
  });

  it("code 를 백틱으로 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([{ type: "text", text: "코드", marks: [{ type: "code" }] }]),
      ),
    ).toBe("`코드`\n");
  });

  it("link 를 [text](href) 로 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([
          {
            type: "text",
            text: "링크",
            marks: [{ type: "link", attrs: { href: "/a" } }],
          },
        ]),
      ),
    ).toBe("[링크](/a)\n");
  });

  it("underline 을 <u> 로 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([{ type: "text", text: "밑줄", marks: [{ type: "underline" }] }]),
      ),
    ).toBe("<u>밑줄</u>\n");
  });

  it("여러 마크가 중첩되면 함께 직렬화한다", () => {
    expect(
      docToMarkdown(
        wrap([
          {
            type: "text",
            text: "굵고밑줄",
            marks: [{ type: "bold" }, { type: "underline" }],
          },
        ]),
      ),
    ).toBe("<u>**굵고밑줄**</u>\n");
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

describe("docToMarkdown - 미지의 JSX 보존", () => {
  it("mdxBlock 을 원문 그대로 직렬화한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "앞 문단" }] },
        {
          type: "mdxBlock",
          attrs: { value: '<Callout type="info">내용</Callout>' },
        },
        { type: "paragraph", content: [{ type: "text", text: "뒷 문단" }] },
      ],
    };
    expect(docToMarkdown(doc)).toBe(
      '앞 문단\n\n<Callout type="info">내용</Callout>\n\n뒷 문단\n',
    );
  });
});

describe("markdownToDoc - 블록", () => {
  it("문단을 paragraph 로 파싱한다", () => {
    expect(markdownToDoc("본문\n")).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "본문" }] },
      ],
    });
  });

  it("# 을 heading level 1로 파싱한다", () => {
    expect(markdownToDoc("# 제목\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "제목" }],
        },
      ],
    });
  });

  it("- 목록을 bulletList 로 파싱한다", () => {
    expect(markdownToDoc("- 항목1\n- 항목2\n")).toEqual({
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
                  content: [{ type: "text", text: "항목1" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "항목2" }],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("숫자 목록을 orderedList 로 파싱한다", () => {
    expect(markdownToDoc("1. 하나\n2. 둘\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "하나" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "둘" }] },
              ],
            },
          ],
        },
      ],
    });
  });

  it("> 인용을 blockquote 로 파싱한다", () => {
    expect(markdownToDoc("> 인용문\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "인용문" }] },
          ],
        },
      ],
    });
  });

  it("펜스 코드블록을 codeBlock 으로 파싱한다", () => {
    expect(markdownToDoc("```ts\nconst a = 1;\n```\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [{ type: "text", text: "const a = 1;" }],
        },
      ],
    });
  });

  it("언어 표시가 없는 코드블록은 language 를 null 로 파싱한다", () => {
    expect(markdownToDoc("```\nplain\n```\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: null },
          content: [{ type: "text", text: "plain" }],
        },
      ],
    });
  });

  it("--- 를 horizontalRule 로 파싱한다", () => {
    expect(markdownToDoc("---\n")).toEqual({
      type: "doc",
      content: [{ type: "horizontalRule" }],
    });
  });

  it("마크다운 이미지를 image 노드로 파싱한다", () => {
    // 마크다운 표기에는 크기·정렬이 없으므로 셋 다 null 로 채운다. 이 값이
    // 그대로 남아 있어야 저장할 때 다시 마크다운 표기로 돌아간다.
    expect(markdownToDoc('![설명](/a.png "제목")\n')).toEqual({
      type: "doc",
      content: [
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
      ],
    });
  });

  it("역슬래시 줄바꿈을 hardBreak 로 파싱한다", () => {
    expect(markdownToDoc("첫줄\\\n둘째줄\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "첫줄" },
            { type: "hardBreak" },
            { type: "text", text: "둘째줄" },
          ],
        },
      ],
    });
  });
});

describe("markdownToDoc - 마크", () => {
  it("** 를 bold 마크로 파싱한다", () => {
    expect(markdownToDoc("**굵게**\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "굵게", marks: [{ type: "bold" }] }],
        },
      ],
    });
  });

  it("_ 를 italic 마크로 파싱한다", () => {
    expect(markdownToDoc("_기울임_\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "기울임", marks: [{ type: "italic" }] },
          ],
        },
      ],
    });
  });

  it("~~ 를 strike 마크로 파싱한다", () => {
    expect(markdownToDoc("~~취소선~~\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "취소선", marks: [{ type: "strike" }] },
          ],
        },
      ],
    });
  });

  it("백틱을 code 마크로 파싱한다", () => {
    expect(markdownToDoc("`코드`\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "코드", marks: [{ type: "code" }] }],
        },
      ],
    });
  });

  it("[text](href) 를 link 마크로 파싱한다", () => {
    expect(markdownToDoc("[링크](/a)\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "링크",
              marks: [{ type: "link", attrs: { href: "/a" } }],
            },
          ],
        },
      ],
    });
  });
});

describe("underline 왕복", () => {
  it("<u> 를 underline 마크로 파싱한다", () => {
    expect(markdownToDoc("<u>밑줄</u>\n")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "밑줄", marks: [{ type: "underline" }] },
          ],
        },
      ],
    });
  });

  it("markdownToDoc(docToMarkdown(doc)) 이 underline 마크를 보존한다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "밑줄", marks: [{ type: "underline" }] },
          ],
        },
      ],
    };
    expect(markdownToDoc(docToMarkdown(doc))).toEqual(doc);
  });
});

describe("미지의 JSX 블록 보존", () => {
  it("Callout 블록이 markdownToDoc 을 거쳐도 원문 그대로 보존된다", () => {
    const md = '앞 문단\n\n<Callout type="info">내용</Callout>\n\n뒷 문단\n';
    const doc = markdownToDoc(md);
    expect(doc.content?.[1]).toEqual({
      type: "mdxBlock",
      attrs: { value: '<Callout type="info">내용</Callout>' },
    });
  });

  it("Callout 블록이 markdownToDoc -> docToMarkdown 을 거쳐도 바이트 단위로 동일하다", () => {
    const md = '앞 문단\n\n<Callout type="info">내용</Callout>\n\n뒷 문단\n';
    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });

  it("여러 줄에 걸친 JSX 블록도 바이트 단위로 보존한다", () => {
    const md =
      "문단.\n\n<Callout>\n  여러 줄에 걸친\n  내용입니다.\n</Callout>\n\n다음 문단.\n";
    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });
});

describe("이미지 - JSX <Image>", () => {
  const jsxImage = (attrs: Record<string, unknown>): JSONContent => ({
    type: "doc",
    content: [{ type: "image", attrs }],
  });

  it("속성을 전부 정적으로 읽을 수 있는 <Image> 를 image 노드로 파싱한다", () => {
    const md = '<Image src="/a.png" width={768} height={400} alt="잡콕" />\n';

    expect(markdownToDoc(md)).toEqual(
      jsxImage({
        src: "/a.png",
        alt: "잡콕",
        width: 768,
        height: 400,
        align: null,
      }),
    );
  });

  it("align 속성을 읽는다", () => {
    const md =
      '<Image src="/a.png" width={10} height={20} alt="" align="left" />\n';

    expect(markdownToDoc(md)).toEqual(
      jsxImage({
        src: "/a.png",
        alt: "",
        width: 10,
        height: 20,
        align: "left",
      }),
    );
  });

  it("width/height 가 있으면 <Image> JSX 로 직렬화한다", () => {
    expect(
      docToMarkdown(
        jsxImage({
          src: "/a.png",
          alt: "잡콕",
          width: 768,
          height: 400,
          align: null,
        }),
      ),
    ).toBe('<Image src="/a.png" alt="잡콕" width={768} height={400} />\n');
  });

  it("align 이 있으면 문자열 prop 으로 덧붙인다", () => {
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

  it("크기가 없으면 마크다운 이미지로 되돌린다", () => {
    expect(
      docToMarkdown(
        jsxImage({
          src: "/a.png",
          alt: "잡콕",
          width: null,
          height: null,
          align: null,
        }),
      ),
    ).toBe("![잡콕](/a.png)\n");
  });

  it("<Image> 가 왕복해도 JSX 로 남는다", () => {
    const md = '<Image src="/a.png" alt="잡콕" width={768} height={400} />\n';

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
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

  it("Image 가 아닌 JSX 는 건드리지 않는다", () => {
    const md = '<Callout type="info">내용</Callout>\n';

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });
});

describe("왕복 - doc -> markdown -> doc", () => {
  it("여러 블록과 마크가 섞인 문서가 왕복 후에도 동일하다", () => {
    const doc: JSONContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "제목" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "굵게", marks: [{ type: "bold" }] },
            { type: "text", text: " 그리고 " },
            {
              type: "text",
              text: "링크",
              marks: [{ type: "link", attrs: { href: "/a" } }],
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "항목" }],
                },
              ],
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "인용" }] },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [{ type: "text", text: "const a = 1;" }],
        },
        { type: "horizontalRule" },
      ],
    };

    expect(markdownToDoc(docToMarkdown(doc))).toEqual(doc);
  });
});

describe("왕복 - markdown -> doc -> markdown", () => {
  it("직접 작성한 마크다운 문자열이 왕복 후에도 동일하다", () => {
    const md = [
      "## 제목",
      "",
      "굵게 **강조**된 문단과 [링크](/a) 그리고 `코드`.",
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
      "---",
      "",
    ].join("\n");

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
  });
});

describe("문단 정렬 - <div style={{ textAlign }}>", () => {
  const alignDiv = (style: string, inner: string) =>
    `<div style={${style}}>\n  ${inner}\n</div>\n`;

  it("가운데 정렬 div 를 문단의 align attr 로 읽는다", () => {
    expect(
      markdownToDoc(alignDiv('{ textAlign: "center" }', "가운데")),
    ).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: { align: "center" },
          content: [{ type: "text", text: "가운데" }],
        },
      ],
    });
  });

  it("오른쪽 정렬 div 를 읽는다", () => {
    expect(markdownToDoc(alignDiv('{ textAlign: "right" }', "오른쪽"))).toEqual(
      {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { align: "right" },
            content: [{ type: "text", text: "오른쪽" }],
          },
        ],
      },
    );
  });

  it("제목도 정렬 대상이다", () => {
    expect(
      markdownToDoc(alignDiv('{ textAlign: "center" }', "## 제목")),
    ).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2, align: "center" },
          content: [{ type: "text", text: "제목" }],
        },
      ],
    });
  });

  it("textAlign: left 는 align 없는 문단으로 정규화한다", () => {
    // 왼쪽은 렌더 기본이라 attr 을 남길 이유가 없다. div 만 사라진다.
    expect(markdownToDoc(alignDiv('{ textAlign: "left" }', "왼쪽"))).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "왼쪽" }] },
      ],
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

  it("헤더 한 줄과 본문 두 줄을 읽는다", () => {
    const md = [
      "| 이름 | 값 |",
      "| - | - |",
      "| a | 1 |",
      "| b | 2 |",
      "",
    ].join("\n");

    expect(markdownToDoc(md)).toEqual({
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

  it("표를 파이프 표기로 직렬화한다", () => {
    const doc: JSONContent = {
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
          ],
        },
      ],
    };

    expect(docToMarkdown(doc)).toBe("| 이름 | 값 |\n| - | - |\n| a | 1 |\n");
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

  it("셀 안의 굵게·링크·인라인 코드를 보존한다", () => {
    const md = [
      "| 서식 | 값 |",
      "| - | - |",
      "| **굵게** | `코드` |",
      "| [링크](/a) | 보통 |",
      "",
    ].join("\n");

    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
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
