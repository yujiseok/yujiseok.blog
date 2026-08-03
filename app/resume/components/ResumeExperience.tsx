import ExternalLink from "@/app/components/externalLink";
import type { resumeData } from "../resume";
import type { RESUME_SECTIONS } from "../sections";
import ResumeSection from "./ResumeSection";

const ResumeExperience = ({
  workExperience,
  section,
}: {
  workExperience: typeof resumeData.workExperience;
  section: (typeof RESUME_SECTIONS)[number];
}) => {
  return (
    <ResumeSection {...section}>
      <div className="grid gap-12">
        {workExperience.map((career) => (
          <article key={career.company} className="grid gap-8">
            <div className="grid gap-1.5">
              <time className="text-[12px] text-neutral-500 tabular-nums">
                {career.period}
              </time>
              <h3 className="text-[16px] font-semibold text-neutral-950">
                {career.company}{" "}
                <ExternalLink
                  href={career.url}
                  className="underline-offset-2 hover:underline"
                >
                  {career.brand}
                </ExternalLink>
              </h3>
            </div>

            <ul className="grid gap-8">
              {career.projects.map((project) => (
                <li key={project.title} className="grid gap-2">
                  <strong className="text-[14.5px] font-semibold text-neutral-900">
                    {project.title}
                  </strong>
                  <ul className="grid gap-1.5 text-[14px] leading-[1.65] text-neutral-700">
                    {project.achievements.map((achievement) => (
                      <li key={achievement} className="relative pl-3.5">
                        <span
                          className="absolute top-[0.6em] left-0 size-1 rounded-full bg-neutral-400"
                          aria-hidden
                        />
                        {achievement}
                      </li>
                    ))}
                    {project.link ? (
                      <li className="pl-3.5">
                        <ExternalLink
                          href={project.link}
                          className="underline underline-offset-2"
                        >
                          {project.linkText}
                        </ExternalLink>
                      </li>
                    ) : null}
                  </ul>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </ResumeSection>
  );
};

export default ResumeExperience;
