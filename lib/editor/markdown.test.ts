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
    expect(markdownToDoc('![설명](/a.png "제목")\n')).toEqual({
      type: "doc",
      content: [
        { type: "image", attrs: { src: "/a.png", alt: "설명", title: "제목" } },
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
