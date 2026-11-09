import { PAGE_BOTTOM, PAGE_TOP } from "@/app/_components/page-spacing";
import BlurContainer from "@/app/_components/blur-container";
import { resumeData as ko, type Resume } from "./resume";
import { resumeData as en } from "./resume.en";
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
    title,
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
  const resumeData = RESUME[locale];
  const { resume } = getDictionary(locale);
  const translated = await getTranslatedSlugs();
  // 영어 이력서는 /en 글로 잇되, 번역이 아직 없는 글은 404 대신 한국어 원문으로 간다.
  const postHref = (slug: string) =>
    `${SITE_URL}${localizedPath(locale === "en" && !translated.has(slug) ? "ko" : locale, `/posts/${slug}`)}`;

  return (
    <main
      className={`text-sm leading-6 break-keep print:m-0 ${PAGE_TOP} ${PAGE_BOTTOM}`}
    >
      <BlurContainer className="mx-auto max-w-[960px] gap-6 rounded-md border border-neutral-200/80 p-4 sm:p-8 dark:border-neutral-200/20">
        <ResumeProfile
          profile={resumeData.profile}
          contact={resumeData.contact}
        />

        <ContentContainer title="Experience">
          <div className="grid gap-4">
            {resumeData.workExperience.map((career) => (
              <ResumeContent
                key={career.company}
                leftContent={<time>{career.period}</time>}
                rightContent={
                  <div className="grid gap-2">
                    <div>
                      <h4 className="mb-1 flex gap-0.5 text-[15px] font-bold">
                        {career.company.split(" ").slice(0, -1).join(" ")}
                        <ExternalLink
                          href={career.url}
                          className="hover:underline"
                        >
                          {career.company.split(" ").pop()}
                        </ExternalLink>
                        <div
                          className="mb-1.5 size-[3px] self-end rounded-full"
                          style={{ backgroundColor: career.color }}
                        />
                      </h4>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {career.projects.map((project, projectIndex) => (
                        <li key={projectIndex}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                            <strong>{project.title}</strong>
                            {project.postSlug && (
                              <ExternalLink
                                href={postHref(project.postSlug)}
                                className="text-xs text-neutral-600 underline underline-offset-2 dark:text-neutral-400"
                              >
                                {project.linkText}
                              </ExternalLink>
                            )}
                          </div>
                          {project.summary && (
                            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                              {project.summary}
                            </p>
                          )}
                          <ul className="mt-1 list-disc space-y-1 pl-8">
                            {project.achievements.map(
                              (achievement, achievementIndex) => (
                                <li key={achievementIndex}>{achievement}</li>
                              ),
                            )}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
            ))}
          </div>
        </ContentContainer>

        <ContentContainer title="Open Source Contributions">
          {resumeData.openSource.map((contribution) => (
            <ResumeContent
              key={contribution.title}
              leftContent={
                <time dateTime={contribution.period}>
                  {contribution.period}
                </time>
              }
              rightContent={
                <p>
                  <strong>{contribution.title}</strong>{" "}
                  {contribution.description} (
                  <ExternalLink
                    href={contribution.link}
                    className="underline underline-offset-2"
                  >
                    {resume.contribution}
                  </ExternalLink>
                  {contribution.blogSlug && (
                    <>
                      {" · "}
                      <ExternalLink
                        href={postHref(contribution.blogSlug)}
                        className="underline underline-offset-2"
                      >
                        {contribution.blogLinkText}
                      </ExternalLink>
                    </>
                  )}
                  )
                </p>
              }
            />
          ))}
        </ContentContainer>

        <ContentContainer title="Other Experience">
          {resumeData.otherExperience.map((item) => (
            <ResumeContent
              key={item.title}
              leftContent={<time dateTime={item.period}>{item.period}</time>}
              rightContent={
                <div className="grid gap-2">
                  <div>
                    <h4 className="mb-1 flex gap-0.5">
                      {item.title}
                      <div
                        className="mb-1.5 size-[3px] self-end rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </h4>
                    <p>{item.description}</p>
                  </div>
                  <ul>
                    {item.details.map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                  </ul>
                </div>
              }
            />
          ))}
        </ContentContainer>

        <ContentContainer title="Education">
          {resumeData.education.map((edu) => (
            <ResumeContent
              key={edu.school}
              leftContent={<time dateTime={edu.period}>{edu.period}</time>}
              rightContent={
                <div className="grid gap-2">
                  <div className="mb-1">{edu.school}</div>
                </div>
              }
            />
          ))}
        </ContentContainer>
      </BlurContainer>
    </main>
  );
};

export default page;
