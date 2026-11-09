import { describe, expect, it } from "vitest";

import { checkTranslation } from "./translation-check";

const SOURCE = `export const metadata = {
  "title": "스포티파이 연동",
  "publishedAt": "2025-03-15",
  "summary": "블로그를 꾸며 봅시다.",
  "published": true
}

## 개요

[대시보드](https://developer.spotify.com/dashboard)에 접속합니다.

<Image
  src="/images/spotify/dashboard.png"
  width={1200}
  height={450}
  alt="대시보드 화면"
/>

\`\`\`ts
const token = "토큰";
\`\`\`

### 마무리

끝.
`;

const GOOD = `export const metadata = {
  "title": "Wiring up Spotify",
  "publishedAt": "2025-03-15",
  "summary": "Let's decorate the blog.",
  "published": true
}

## Overview

Open the [dashboard](https://developer.spotify.com/dashboard).

<Image
  src="/images/spotify/dashboard.png"
  width={1200}
  height={450}
  alt="Dashboard screen"
/>

\`\`\`ts
const token = "토큰";
\`\`\`

### Wrap-up

Done.
`;

const withReplace = (from: string, to: string) => {
  expect(GOOD).toContain(from);
  return GOOD.replace(from, to);
};

describe("checkTranslation", () => {
  it("올바른 번역은 문제가 없다", async () => {
    expect(await checkTranslation(SOURCE, GOOD)).toEqual([]);
  });

  it("metadata export 가 없으면 파싱 실패를 알린다", async () => {
    const issues = await checkTranslation(SOURCE, "## Overview\n");
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("metadata");
  });

  it("publishedAt 이 바뀌면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("2025-03-15", "2025-03-16"),
    );
    expect(issues).toEqual([expect.stringContaining("publishedAt")]);
  });

  it("published 가 바뀌면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace('"published": true', '"published": false'),
    );
    expect(issues).toEqual([expect.stringContaining("published")]);
  });

  it("헤딩 레벨 순서가 다르면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("### Wrap-up", "## Wrap-up"),
    );
    expect(issues).toEqual([expect.stringContaining("헤딩")]);
  });

  it("헤딩이 빠지면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("### Wrap-up\n\n", ""),
    );
    expect(issues).toEqual([expect.stringContaining("헤딩")]);
  });

  it("코드펜스 내용이 바뀌면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace('"토큰"', '"token"'),
    );
    expect(issues).toEqual([expect.stringContaining("코드")]);
  });

  it("링크 href 가 바뀌면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("developer.spotify.com/dashboard", "example.com"),
    );
    expect(issues.join("\n")).toContain("developer.spotify.com/dashboard");
    expect(issues.join("\n")).toContain("example.com");
  });

  it("이미지 src 가 바뀌면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("/images/spotify/dashboard.png", "/images/x.png"),
    );
    expect(issues).toEqual([expect.stringContaining("이미지")]);
  });

  it("alt 번역은 허용한다", async () => {
    expect(
      await checkTranslation(SOURCE, withReplace("Dashboard screen", "Screen")),
    ).toEqual([]);
  });

  it("JSX 컴포넌트가 빠지면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      GOOD.replace(/<Image[\s\S]*?\/>\n\n/, ""),
    );
    expect(issues).toEqual(
      expect.arrayContaining([expect.stringContaining("컴포넌트")]),
    );
  });

  it("코드 밖에 한글이 많이 남으면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("Done.", "번역하지 않은 문장이 그대로 남아 있습니다."),
    );
    expect(issues).toEqual([expect.stringContaining("한글")]);
  });

  it("고유명사 정도의 한글은 허용한다", async () => {
    expect(
      await checkTranslation(
        SOURCE,
        withReplace("Done.", "Done (감사합니다)."),
      ),
    ).toEqual([]);
  });

  it("MDX 로 컴파일되지 않으면 알린다", async () => {
    const issues = await checkTranslation(
      SOURCE,
      withReplace("Done.", "Done <b> unclosed {"),
    );
    expect(issues).toEqual(
      expect.arrayContaining([expect.stringContaining("컴파일")]),
    );
  });
});

describe("checkTranslation — 번역이 자연스럽게 바꾸는 것", () => {
  const post = (body: string) => `export const metadata = {
  "title": "Title",
  "publishedAt": "2025-03-15",
  "published": true
}

${body}
`;

  it("어순 때문에 인라인 코드 순서가 바뀌어도 통과한다", async () => {
    expect(
      await checkTranslation(
        post("`useQuery`와 `useMutation`을 씁니다."),
        post("You use `useMutation` after `useQuery`."),
      ),
    ).toEqual([]);
  });

  it("같은 인라인 코드를 더 자주 언급해도 통과한다", async () => {
    expect(
      await checkTranslation(
        post("`fetch`를 씁니다."),
        post("Use `fetch`. Then `fetch` again."),
      ),
    ).toEqual([]);
  });

  it("인라인 코드 안의 특수 공백 차이는 무시한다", async () => {
    expect(
      await checkTranslation(post("`a b ` 입니다."), post("It is `a b `.")),
    ).toEqual([]);
  });

  it("한글이 든 인라인 코드는 번역해도 통과한다", async () => {
    expect(
      await checkTranslation(
        post("조건은 `8자 이상` 입니다."),
        post("It must be `8 characters or more`."),
      ),
    ).toEqual([]);
  });

  it("어순 때문에 링크 순서가 바뀌어도 통과한다", async () => {
    expect(
      await checkTranslation(
        post("[가](https://a.dev)와 [나](https://b.dev)"),
        post("[B](https://b.dev) and [A](https://a.dev)"),
      ),
    ).toEqual([]);
  });
});

describe("checkTranslation — 여전히 잡아야 하는 것", () => {
  const post = (body: string) => `export const metadata = {
  "title": "Title",
  "publishedAt": "2025-03-15",
  "published": true
}

${body}
`;

  it("인라인 코드가 빠지거나 바뀌면 그 항목을 짚어 알린다", async () => {
    const issues = await checkTranslation(
      post("`useQuery`와 `useMutation`을 씁니다."),
      post("You use `useQuery` and `useMutate`."),
    );

    expect(issues.join("\n")).toContain("useMutation");
    expect(issues.join("\n")).toContain("useMutate");
  });

  it("코드펜스 순서가 바뀌면 알린다", async () => {
    const a = "```ts\nconst a = 1;\n```";
    const b = "```ts\nconst b = 2;\n```";

    expect(
      await checkTranslation(post(`${a}\n\n${b}`), post(`${b}\n\n${a}`)),
    ).not.toEqual([]);
  });

  it("링크가 빠지면 알린다", async () => {
    const issues = await checkTranslation(
      post("[가](https://a.dev)와 [나](https://b.dev)"),
      post("[A](https://a.dev) and B"),
    );

    expect(issues.join("\n")).toContain("https://b.dev");
  });

  it("어긋난 코드 전체를 메시지에 쏟지 않는다", async () => {
    const huge = `const value = "${"x".repeat(5000)}";`;
    const issues = await checkTranslation(
      post(`\`\`\`ts\n${huge}\n\`\`\``),
      post("```ts\nconst other = 1;\n```"),
    );

    expect(issues.join("\n").length).toBeLessThan(1000);
  });
});
