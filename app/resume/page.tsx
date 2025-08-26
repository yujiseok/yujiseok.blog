import ArrowUpRight from "@/app/components/arrowUpRight";
import BlurContainer from "@/app/components/blurContainer";
import { resumeData } from "./resume";

export const metadata = {
  title: "유지석 이력서",
  description: "Frontend Engineer 유지석의 이력서",
};

const page = () => {
  return (
    <div
      data-resume-page="true"
      className="py-4 text-sm break-keep sm:px-4 sm:py-12"
    >
      <BlurContainer className="mx-auto max-w-4xl gap-6 rounded-md border border-neutral-200/80 p-6 sm:p-8 dark:border-neutral-200/20">
        <ResumeProfile profile={resumeData.profile} />

        <ContentContainer title="Careers">
          <div className="grid gap-4">
            {resumeData.careers.map((career) => (
              <ResumeContent
                key={career.company}
                leftContent={<time dateTime="2023-11">{career.period}</time>}
                rightContent={
                  <div className="grid gap-2">
                    <div>
                      <h4 className="mb-1 flex gap-0.5">
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
                          <br />
                          {project.description}
                          <ul className="mt-1 list-disc space-y-1 pl-8">
                            {project.achievements.map(
                              (achievement, achievementIndex) => (
                                <li key={achievementIndex}>{achievement}</li>
                              ),
                            )}
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
              leftContent={<time>{contribution.period}</time>}
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
              leftContent={<time>{item.period}</time>}
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
                className="group flex hover:underline"
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
                className="group flex hover:underline"
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
                className="group flex hover:underline"
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
                className="group flex hover:underline"
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
              leftContent={<time>{edu.period}</time>}
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
        <small className="text-neutral-600 dark:text-neutral-400">
          {profile.title}
        </small>
      </div>

      <div className="grid gap-2 leading-6">
        {profile.introduction.map((paragraph: string) => (
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
    <div className="grid gap-2 leading-6 sm:grid-cols-[150px_1fr] sm:gap-9">
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
      <h3 className="font-semibold">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </div>
  );
};
