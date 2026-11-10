import {
  PAGE_BOTTOM,
  PAGE_TOP,
  PAGE_WIDTH,
} from "@/app/_components/page-spacing";
import { resumeData as ko, type Resume } from "./resume";
import { resumeData as en } from "./resume.en";
import { resolveResume, resumePdfHref, SECTION_TITLES } from "./resolve";
import { SITE_URL } from "@/lib/constants";
import ResumeProfile from "./_components/resume-profile";
import ResumeContent from "./_components/resume-content";
import ContentContainer from "./_components/content-container";
import { alternates, siteOg } from "@/lib/metadata";
import ExternalLink from "@/app/_components/external-link";
import { getTranslatedSlugs } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

const RESUME: Record<Locale, Resume> = { ko, en };

export async function generateMetadata({ params }: LocaleParams) {
  const locale = await requireLocale(params);
  const { profile } = RESUME[locale];
  const { site, resume } = getDictionary(locale);
  const title = `${profile.name} | ${profile.title}`;

  return {
    // 이름이 곧 사이트 이름이라 레이아웃 템플릿("%s | Yujiseok")을 붙이면 중복된다.
    title: { absolute: title },
    description: profile.introduction[0],
    keywords: [
      profile.title,
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "UI/UX",
      ...resume.keywords,
    ],
    authors: [{ name: profile.name }],
    creator: profile.name,
    publisher: profile.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: alternates(locale, "/resume"),
    openGraph: {
      title,
      description: profile.introduction[0],
      url: `${SITE_URL}${localizedPath(locale, "/resume")}`,
      ...siteOg(locale),
      type: "profile",
      images: [
        {
          url: "/images/avatar.jpg",
          width: 400,
          height: 400,
          alt: resume.avatarAlt(profile.name),
        },
      ],
    },
    twitter: {
      card: "summary",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const page = async ({ params }: LocaleParams) => {
  const locale = await requireLocale(params);
  const resumeData = resolveResume(locale, await getTranslatedSlugs());

  return (
    <main
      className={`text-sm leading-6 break-keep sm:text-[15px] print:m-0 ${PAGE_TOP} ${PAGE_BOTTOM}`}
    >
      <section
        className={`mx-auto grid gap-10 sm:rounded-md sm:border sm:border-neutral-200/80 sm:p-8 sm:dark:border-neutral-200/20 ${PAGE_WIDTH.resume}`}
      >
        <ResumeProfile
          profile={resumeData.profile}
          contact={resumeData.contact}
          pdfHref={resumePdfHref(locale)}
        />

        <ContentContainer title={SECTION_TITLES.experience}>
          {resumeData.workExperience.map((career) => (
            <ResumeContent
              key={career.company}
              period={career.period}
              titleClassName="text-base sm:text-[17px]"
              title={
                <span className="flex gap-0.5">
                  {career.company.split(" ").slice(0, -1).join(" ")}
                  <ExternalLink href={career.url} className="hover:underline">
                    {career.company.split(" ").pop()}
                  </ExternalLink>
                  <span
                    className="mb-1.5 size-[3px] self-end rounded-full"
                    style={{ backgroundColor: career.color }}
                  />
                </span>
              }
            >
              <ul className="mt-3 flex flex-col gap-6">
                {career.projects.map((project) => (
                  <li
                    key={project.title}
                    className="grid sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-x-4"
                  >
                    <h4 className="text-[15px] font-semibold sm:text-base">
                      {project.title}
                    </h4>
                    {project.postUrl && (
                      // 좁은 화면에서는 제목과 설명 사이에 끼면 부제처럼 읽혀 항목 맨 아래로 보낸다.
                      <ExternalLink
                        href={project.postUrl}
                        className="order-last mt-1 justify-self-start text-xs text-neutral-600 underline underline-offset-2 sm:order-none sm:mt-0 sm:text-[13px] dark:text-neutral-400"
                      >
                        {project.linkText}
                      </ExternalLink>
                    )}
                    {project.summary && (
                      <p className="mt-1 text-neutral-600 sm:col-span-2 dark:text-neutral-400">
                        {project.summary}
                      </p>
                    )}
                    <ul className="mt-1 list-disc space-y-1.5 pl-5 leading-[22px] sm:col-span-2 sm:leading-6">
                      {project.achievements.map((achievement) => (
                        <li key={achievement}>{achievement}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </ResumeContent>
          ))}
        </ContentContainer>

        <ContentContainer title={SECTION_TITLES.openSource}>
          {resumeData.openSource.map((contribution) => (
            <ResumeContent
              key={contribution.title}
              title={contribution.title}
              period={contribution.period}
            >
              <p>
                {contribution.description} (
                <ExternalLink
                  href={contribution.link}
                  className="underline underline-offset-2"
                >
                  PR #{contribution.link.split("/").pop()}
                </ExternalLink>
                {contribution.blogUrl && (
                  <>
                    {" · "}
                    <ExternalLink
                      href={contribution.blogUrl}
                      className="underline underline-offset-2"
                    >
                      {contribution.blogLinkText}
                    </ExternalLink>
                  </>
                )}
                )
              </p>
            </ResumeContent>
          ))}
        </ContentContainer>

        <ContentContainer title={SECTION_TITLES.otherExperience}>
          {resumeData.otherExperience.map((item) => (
            <ResumeContent
              key={item.title}
              period={item.period}
              title={
                <span className="flex gap-0.5">
                  {item.title}
                  <span
                    className="mb-1.5 size-[3px] self-end rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </span>
              }
            >
              <p>{item.description}</p>
              {item.details.length > 0 && (
                <ul className="mt-2">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </ResumeContent>
          ))}
        </ContentContainer>

        <ContentContainer title={SECTION_TITLES.education}>
          {resumeData.education.map((edu) => (
            <ResumeContent
              key={edu.school}
              title={edu.school}
              period={edu.period}
            />
          ))}
        </ContentContainer>
      </section>
    </main>
  );
};

export default page;
