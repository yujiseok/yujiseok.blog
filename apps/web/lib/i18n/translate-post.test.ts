import { describe, expect, it, vi } from "vitest";

import {
  parseReview,
  stripCodeFence,
  translatePost,
  type ClaudeCall,
} from "./translate-post";

const SOURCE = `export const metadata = {
  "title": "제목",
  "publishedAt": "2025-03-15",
  "summary": "요약",
  "published": true
}

## 개요

본문입니다.
`;

const GOOD = `export const metadata = {
  "title": "Title",
  "publishedAt": "2025-03-15",
  "summary": "Summary",
  "published": true
}

## Overview

This is the body.
`;

const BAD_UNTRANSLATED = SOURCE;

const review = (score: number, issues: string[] = []) =>
  JSON.stringify({ score, issues });

// 호출 종류를 프롬프트로 구분해 순서대로 응답을 돌려주는 가짜 claude
const fakeClaude = (translations: string[], reviews: string[]) => {
  const t = [...translations];
  const r = [...reviews];
  const calls: { kind: "translate" | "review"; input: string }[] = [];
  const claude: ClaudeCall = async ({ kind, input }) => {
    calls.push({ kind, input });
    const next = kind === "translate" ? t.shift() : r.shift();
    if (next === undefined) throw new Error(`unexpected ${kind} call`);
    return next;
  };
  return { claude, calls };
};

describe("stripCodeFence", () => {
  it.each([
    ["```mdx\nhello\n```\n", "hello\n"],
    ["hello\n```ts\nx\n```\n", "hello\n```ts\nx\n```\n"],
  ])("%j → %j (전체를 감싼 래퍼만 벗긴다)", (input, expected) => {
    expect(stripCodeFence(input)).toBe(expected);
  });
});

describe("parseReview", () => {
  it.each([
    ['{"score":5,"issues":[]}', { score: 5, issues: [] }],
    [
      '결과입니다:\n```json\n{"score":3,"issues":["a"]}\n```\n끝',
      { score: 3, issues: ["a"] },
    ],
    ['{"score":9,"issues":[]}', null],
    ["good job", null],
  ])("%j → %j", (raw, expected) => {
    expect(parseReview(raw)).toEqual(expected);
  });
});

describe("translatePost", () => {
  it("구조 검사와 리뷰(4점 이상)를 통과하면 번역문을 돌려준다", async () => {
    const { claude } = fakeClaude([GOOD], [review(5)]);
    const result = await translatePost(SOURCE, { claude });
    expect(result).toEqual({
      ok: true,
      translation: GOOD,
      score: 5,
      issues: [],
    });
  });

  it("구조 검사 실패 시 issues 를 피드백으로 넣어 한 번 재번역한다", async () => {
    const { claude, calls } = fakeClaude([BAD_UNTRANSLATED, GOOD], [review(5)]);
    const result = await translatePost(SOURCE, { claude });
    expect(result).toMatchObject({ ok: true, translation: GOOD });
    const translateCalls = calls.filter((c) => c.kind === "translate");
    expect(translateCalls).toHaveLength(2);
    expect(translateCalls[1].input).toContain("한글");
  });

  it("구조 검사 실패 번역은 리뷰 호출 없이 버린다", async () => {
    const { claude, calls } = fakeClaude([BAD_UNTRANSLATED, GOOD], [review(5)]);
    await translatePost(SOURCE, { claude });
    expect(calls.map((c) => c.kind)).toEqual([
      "translate",
      "translate",
      "review",
    ]);
  });

  it("리뷰 점수가 4 미만이면 리뷰 issues 를 넣어 재번역한다", async () => {
    const { claude, calls } = fakeClaude(
      [GOOD, GOOD],
      [review(2, ["3문단 누락"]), review(5)],
    );
    const result = await translatePost(SOURCE, { claude });
    expect(result).toMatchObject({ ok: true, score: 5 });
    const second = calls.filter((c) => c.kind === "translate")[1];
    expect(second.input).toContain("3문단 누락");
  });

  it("재시도 후에도 실패하면 ok:false 와 이유를 돌려주고 더 시도하지 않는다", async () => {
    const claude = vi.fn<ClaudeCall>(async ({ kind }) =>
      kind === "translate" ? BAD_UNTRANSLATED : review(5),
    );
    const result = await translatePost(SOURCE, { claude });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.join("\n")).toContain("한글");
    expect(claude).toHaveBeenCalledTimes(2);
  });

  it("리뷰 응답을 못 읽으면 실패로 취급한다", async () => {
    const { claude } = fakeClaude([GOOD, GOOD], ["???", "???"]);
    const result = await translatePost(SOURCE, { claude });
    expect(result.ok).toBe(false);
  });
});
