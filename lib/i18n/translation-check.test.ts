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
    expect(issues).toEqual([expect.stringContaining("링크")]);
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
