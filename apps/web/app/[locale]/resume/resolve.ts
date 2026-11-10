import type { Locale } from "@/lib/i18n/locales";
import { absoluteUrl, postPath } from "@/lib/metadata";

import { resumeData as ko, type Resume } from "./resume";
import { resumeData as en } from "./resume.en";

const RESUME: Record<Locale, Resume> = { ko, en };

export const getResume = (locale: Locale) => RESUME[locale];

/* 섹션 제목은 두 언어 모두 영어로 둔다. 블로그와 Figma 플러그인이 같은 값을 쓴다. */
export const SECTION_TITLES = {
  experience: "Experience",
  openSource: "Open Source Contributions",
  otherExperience: "Other Experience",
  education: "Education",
} as const;

/* Figma에서 만든 PDF가 놓이는 public 경로. 손으로 여기에 넣는다. */
export const resumePdfPath = (locale: Locale) =>
  locale === "ko" ? "/resume.pdf" : `/resume.${locale}.pdf`;

/*
 * public에 PDF를 넣은 언어. 넣지 않은 언어까지 링크를 내면 404로 이어진다.
 * 런타임에 파일을 확인하지 않는 건 Vercel 함수 번들에 public이 없어서다.
 * 목록과 실제 파일이 맞는지는 resolve.test.ts가 지킨다.
 */
const PUBLISHED_PDF_LOCALES: readonly Locale[] = ["ko"];

export const resumePdfHref = (locale: Locale) =>
  PUBLISHED_PDF_LOCALES.includes(locale) ? resumePdfPath(locale) : undefined;

type Project = Resume["workExperience"][number]["projects"][number];
type Contribution = Resume["openSource"][number];

/*
 * slug를 언어별 절대 주소로 바꾼 이력서. 블로그 화면과 Figma 동기화(/resume.json)가
 * 같은 데이터를 보게 하려고 링크 해석을 여기 한곳에 둔다.
 */
export type ResolvedResume = Omit<Resume, "workExperience" | "openSource"> & {
  workExperience: (Omit<Resume["workExperience"][number], "projects"> & {
    projects: (Omit<Project, "postSlug"> & { postUrl?: string })[];
  })[];
  openSource: (Omit<Contribution, "blogSlug"> & { blogUrl?: string })[];
};

/* 영어 이력서는 /en 글로 잇되, 번역이 아직 없는 글은 404 대신 한국어 원문으로 간다. */
export const postUrl = (
  locale: Locale,
  slug: string,
  translated: ReadonlySet<string>,
) =>
  absoluteUrl(
    locale === "en" && !translated.has(slug) ? "ko" : locale,
    postPath(slug),
  );

export const resolveResume = (
  locale: Locale,
  translated: ReadonlySet<string>,
): ResolvedResume => {
  const resume = getResume(locale);

  return {
    ...resume,
    workExperience: resume.workExperience.map((career) => ({
      ...career,
      projects: career.projects.map(({ postSlug, ...project }) => ({
        ...project,
        ...(postSlug && { postUrl: postUrl(locale, postSlug, translated) }),
      })),
    })),
    openSource: resume.openSource.map(({ blogSlug, ...contribution }) => ({
      ...contribution,
      ...(blogSlug && { blogUrl: postUrl(locale, blogSlug, translated) }),
    })),
  };
};
