import { describe, expect, it } from "vitest";

import { resolveResume } from "./resolve";

const projectUrls = (resume: ReturnType<typeof resolveResume>) =>
  resume.workExperience.flatMap((career) =>
    career.projects.map((project) => project.postUrl),
  );

describe("resolveResume", () => {
  it("한국어는 /ko 글 주소로 잇는다", () => {
    const urls = projectUrls(resolveResume("ko", new Set()));

    expect(urls).toContain("https://yujiseok.blog/ko/posts/turborepo");
  });

  it("영어는 번역이 있는 글만 /en으로, 없는 글은 /ko로 잇는다", () => {
    const urls = projectUrls(resolveResume("en", new Set(["turborepo"])));

    expect(urls).toContain("https://yujiseok.blog/en/posts/turborepo");
    expect(urls).toContain("https://yujiseok.blog/ko/posts/2024-gencon");
  });

  it("slug를 남기지 않고 글이 없는 항목에는 주소를 달지 않는다", () => {
    const resume = resolveResume("ko", new Set());
    const projects = resume.workExperience.flatMap((c) => c.projects);

    expect(projects.some((p) => "postSlug" in p)).toBe(false);
    expect(projects.some((p) => p.postUrl === undefined)).toBe(true);
    expect(resume.openSource.some((c) => "blogSlug" in c)).toBe(false);
  });
});
