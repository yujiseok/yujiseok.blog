import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { LOCALES } from "@/lib/i18n/locales";

import { resolveResume, resumePdfHref, resumePdfPath } from "./resolve";

const projectUrls = (resume: ReturnType<typeof resolveResume>) =>
  resume.workExperience.flatMap((career) =>
    career.projects.map((project) => project.postUrl),
  );

describe("resolveResume", () => {
  it.each([
    ["ko", [], ["https://yujiseok.blog/ko/posts/turborepo"]],
    // 번역이 없는 글을 /en 으로 이으면 404 다
    [
      "en",
      ["turborepo"],
      [
        "https://yujiseok.blog/en/posts/turborepo",
        "https://yujiseok.blog/ko/posts/2024-gencon",
      ],
    ],
  ] as const)(
    "%s: 글 주소를 %j 번역 기준으로 잇는다",
    (locale, translated, expected) => {
      const urls = projectUrls(resolveResume(locale, new Set(translated)));

      expect(urls).toEqual(expect.arrayContaining([...expected]));
    },
  );
});

describe("resumePdfHref", () => {
  it.each(LOCALES)("%s: 링크를 내는 PDF는 public에 실제로 있다", (locale) => {
    const href = resumePdfHref(locale);
    if (href === undefined) return;

    expect(fs.existsSync(path.join(process.cwd(), "public", href))).toBe(true);
  });

  it("PDF가 아직 없는 언어는 링크를 내지 않는다", () => {
    const missing = LOCALES.filter(
      (locale) =>
        !fs.existsSync(
          path.join(process.cwd(), "public", resumePdfPath(locale)),
        ),
    );

    for (const locale of missing) {
      expect(resumePdfHref(locale)).toBeUndefined();
    }
  });
});
