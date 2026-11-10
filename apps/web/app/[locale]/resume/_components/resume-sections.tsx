import ExternalLink from "@/app/_components/external-link";

import { SECTION_TITLES, type ResolvedResume } from "../resolve";
import ContentContainer from "./content-container";
import ResumeContent from "./resume-content";

const ColorDot = ({ color }: { color: string }) => (
  <span
    className="mb-1.5 size-[3px] self-end rounded-full"
    style={{ backgroundColor: color }}
  />
);

export const ExperienceSection = ({
  workExperience,
}: Pick<ResolvedResume, "workExperience">) => (
  <ContentContainer title={SECTION_TITLES.experience}>
    {workExperience.map((career) => {
      const nameWords = career.company.split(" ");
      const brand = nameWords.pop();

      return (
        <ResumeContent
          key={career.company}
          period={career.period}
          titleClassName="text-base sm:text-[17px]"
          title={
            <span className="flex gap-0.5">
              {nameWords.join(" ")}
              <ExternalLink href={career.url} className="hover:underline">
                {brand}
              </ExternalLink>
              <ColorDot color={career.color} />
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
      );
    })}
  </ContentContainer>
);

export const OpenSourceSection = ({
  openSource,
}: Pick<ResolvedResume, "openSource">) => (
  <ContentContainer title={SECTION_TITLES.openSource}>
    {openSource.map((contribution) => (
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
);

export const OtherExperienceSection = ({
  otherExperience,
}: Pick<ResolvedResume, "otherExperience">) => (
  <ContentContainer title={SECTION_TITLES.otherExperience}>
    {otherExperience.map((item) => (
      <ResumeContent
        key={item.title}
        period={item.period}
        title={
          <span className="flex gap-0.5">
            {item.title}
            <ColorDot color={item.color} />
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
);

export const EducationSection = ({
  education,
}: Pick<ResolvedResume, "education">) => (
  <ContentContainer title={SECTION_TITLES.education}>
    {education.map((edu) => (
      <ResumeContent key={edu.school} title={edu.school} period={edu.period} />
    ))}
  </ContentContainer>
);
