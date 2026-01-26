import ArrowUpRight from "@/app/components/arrowUpRight";
import BlurContainer from "@/app/components/blurContainer";
import { resumeData } from "./resume";

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
  metadataBase: new URL("https://yujiseok.blog"),
  alternates: {
    canonical: "/resume",
  },
  openGraph: {
    title: `${resumeData.profile.name} | ${resumeData.profile.title}`,
    description: resumeData.profile.introduction[0],
    url: "https://yujiseok.blog/resume",
    siteName: "유지석 블로그",
    locale: "ko_KR",
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
    title: `${resumeData.profile.name} | ${resumeData.profile.title}`,
    description: resumeData.profile.introduction[0],
    images: ["/images/avatar.jpg"],
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
    <div
      data-resume-page="true"
      className="py-4 text-sm leading-6 break-keep sm:px-4 sm:py-12"
    >
      <BlurContainer className="mx-auto max-w-[960px] gap-6 rounded-md border border-neutral-200/80 p-6 sm:p-8 dark:border-neutral-200/20">
        <ResumeProfile profile={resumeData.profile} />

        <ContentContainer title="Careers">
          <div className="grid gap-4">
            {resumeData.careers.map((career) => (
              <ResumeContent
                key={career.company}
                leftContent={<time>{career.period}</time>}
                rightContent={
                  <div className="grid gap-2">
                    <div>
                      <h4 className="mb-1 text-[15px] font-bold flex gap-0.5">
                        {career.company.split(" ").slice(0, -1).join(" ")}
                        <a
                          href={career.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {career.company.split(" ").pop()}
                        </a>
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
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2"
                                >
                                  {project.linkText}
                                </a>
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
                      <a
                        href={contribution.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        기여
                      </a>
                    </h4>
                    <p>{contribution.description}</p>
                    {"blogLink" in contribution && contribution.blogLink && (
                      <p>
                        <a
                          href={contribution.blogLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {contribution.blogLinkText}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              }
            />
          ))}
        </ContentContainer>

        <ContentContainer title="Etc">
          {resumeData.etc.map((item) => (
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
              <a
                href={`mailto:${resumeData.contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex hover:underline"
              >
                {resumeData.contact.email}
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent="GitHub"
            rightContent={
              <a
                href={resumeData.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex hover:underline"
              >
                yujiseok
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent="Blog"
            rightContent={
              <a
                href={resumeData.contact.blog}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex hover:underline"
              >
                yujiseok.blog
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent="Phone"
            rightContent={
              <a
                href={`tel:+82${resumeData.contact.phone.replace(/-/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex hover:underline"
              >
                {resumeData.contact.phone}
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
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
    </div>
  );
};

export default page;

const ResumeProfile = ({
  profile,
}: {
  profile: {
    name: string;
    title: string;
    introduction: readonly string[];
  };
}) => {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        <small className="text-xs text-neutral-600 dark:text-neutral-400">
          {profile.title}
        </small>
      </div>

      <div className="grid gap-2">
        {profile.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

const ResumeContent = ({
  rightContent,
  leftContent,
}: {
  rightContent: React.ReactNode;
  leftContent: React.ReactNode;
}) => {
  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-10">
      <div className="text-neutral-600 dark:text-neutral-400">
        {leftContent}
      </div>
      <div>{rightContent}</div>
    </div>
  );
};

const ContentContainer = ({
  title,
  children,
}: {
  title:
  | "Careers"
  | "Open Source Contribution"
  | "Education"
  | "Etc"
  | "Contact";
  children: React.ReactNode;
}) => {
  return (
    <div className="grid gap-4 sm:gap-6">
      <h3 className="font-semibold text-base">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </div>
  );
};
