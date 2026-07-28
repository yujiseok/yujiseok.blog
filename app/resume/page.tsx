import ArrowUpRight from "@/app/components/arrowUpRight";
import BlurContainer from "@/app/components/blurContainer";
import { resumeData } from "./resume";
import { SITE_URL } from "@/lib/constants";
import ResumeProfile from "./components/ResumeProfile";
import ResumeContent from "./components/ResumeContent";
import ContentContainer from "./components/ContentContainer";
import { alternates, SITE_OG } from "@/lib/metadata";
import ExternalLink from "@/app/components/externalLink";

export const metadata = {
  title: `${resumeData.profile.name} | ${resumeData.profile.title}`,
  description: resumeData.profile.introduction[0],
  keywords: [
    resumeData.profile.title,
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "UI/UX",
    "웹 개발",
    "프론트엔드",
  ],
  authors: [{ name: resumeData.profile.name }],
  creator: resumeData.profile.name,
  publisher: resumeData.profile.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: alternates("/resume"),
  openGraph: {
    title: `${resumeData.profile.name} | ${resumeData.profile.title}`,
    description: resumeData.profile.introduction[0],
    url: `${SITE_URL}/resume`,
    ...SITE_OG,
    type: "profile",
    images: [
      {
        url: "/images/avatar.jpg",
        width: 400,
        height: 400,
        alt: `${resumeData.profile.name} 프로필 이미지`,
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

const page = () => {
  return (
    <main
      data-resume-page="true"
      className="py-4 text-sm leading-6 break-keep sm:px-4 sm:py-12"
    >
      <BlurContainer className="mx-auto max-w-[960px] gap-6 rounded-md border border-neutral-200/80 p-6 sm:p-8 dark:border-neutral-200/20">
        <ResumeProfile profile={resumeData.profile} />

        <ContentContainer title="Work Experience">
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
                          <strong>{project.title}</strong>
                          <ul className="mt-1 list-disc space-y-1 pl-8">
                            {project.achievements.map(
                              (achievement, achievementIndex) => (
                                <li key={achievementIndex}>{achievement}</li>
                              ),
                            )}
                            {project.link && (
                              <li>
                                <ExternalLink
                                  href={project.link}
                                  className="underline underline-offset-2"
                                >
                                  {project.linkText}
                                </ExternalLink>
                              </li>
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

        <ContentContainer title="Open Source Contribution">
          {resumeData.openSource.map((contribution) => (
            <ResumeContent
              key={contribution.title}
              leftContent={
                <time dateTime={contribution.period}>
                  {contribution.period}
                </time>
              }
              rightContent={
                <div className="grid gap-2">
                  <div>
                    <h4 className="mb-1">
                      {contribution.title}{" "}
                      <ExternalLink
                        href={contribution.link}
                        className="underline underline-offset-2"
                      >
                        기여
                      </ExternalLink>
                    </h4>
                    <p>{contribution.description}</p>
                    {"blogLink" in contribution && contribution.blogLink && (
                      <p>
                        <ExternalLink
                          href={contribution.blogLink}
                          className="underline underline-offset-2"
                        >
                          {contribution.blogLinkText}
                        </ExternalLink>
                      </p>
                    )}
                  </div>
                </div>
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

        <ContentContainer title="Contact">
          <ResumeContent
            leftContent="Email"
            rightContent={
              <ExternalLink
                href={`mailto:${resumeData.contact.email}`}
                className="group inline-flex hover:underline"
              >
                {resumeData.contact.email}
                <ArrowUpRight className="mb-1 scale-75" />
              </ExternalLink>
            }
          />
          <ResumeContent
            leftContent="GitHub"
            rightContent={
              <ExternalLink
                href={resumeData.contact.github}
                className="group inline-flex hover:underline"
              >
                yujiseok
                <ArrowUpRight className="mb-1 scale-75" />
              </ExternalLink>
            }
          />
          <ResumeContent
            leftContent="Blog"
            rightContent={
              <ExternalLink
                href={resumeData.contact.blog}
                className="group inline-flex hover:underline"
              >
                yujiseok.blog
                <ArrowUpRight className="mb-1 scale-75" />
              </ExternalLink>
            }
          />
          <ResumeContent
            leftContent="Phone"
            rightContent={
              <ExternalLink
                href={`tel:+82${resumeData.contact.phone.replace(/-/g, "")}`}
                className="group inline-flex hover:underline"
              >
                {resumeData.contact.phone}
                <ArrowUpRight className="mb-1 scale-75" />
              </ExternalLink>
            }
          />
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
