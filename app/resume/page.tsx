import { Archivo } from "next/font/google";
import { resumeData } from "./resume";
import { RESUME_SECTIONS } from "./sections";
import { SITE_URL } from "@/lib/constants";
import ResumeContacts from "./components/ResumeContacts";
import ResumeExperience from "./components/ResumeExperience";
import ResumeSection from "./components/ResumeSection";
import { alternates, SITE_OG } from "@/lib/metadata";
import ExternalLink from "@/app/components/externalLink";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-resume-display",
  display: "swap",
});

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

const [
  experienceSection,
  openSourceSection,
  otherExperienceSection,
  educationSection,
] = RESUME_SECTIONS;

const page = () => {
  return (
    <main
      data-resume-page="true"
      className={`${archivo.variable} resume-sheet min-h-dvh break-keep text-neutral-900`}
    >
      <div className="resume-sheet-inner mx-auto max-w-[860px] px-6 py-12 sm:px-10 sm:py-16 lg:py-20">
        <div className="grid gap-14 sm:gap-16">
          <header className="grid gap-6">
            <div className="grid gap-4">
              <h1 className="font-resume max-w-[14ch] text-[clamp(2.5rem,6vw,3.5rem)] leading-[0.92] font-bold tracking-[-0.035em] text-neutral-950">
                {resumeData.profile.name}
                <span className="text-neutral-400">,</span>{" "}
                <span className="whitespace-nowrap">
                  {resumeData.profile.title}
                </span>
              </h1>
              <ResumeContacts contact={resumeData.contact} />
            </div>
            <div className="h-px w-full bg-neutral-950/85" />
            <div className="grid max-w-2xl gap-2 text-[14px] leading-[1.65] text-neutral-600">
              {resumeData.profile.introduction.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </header>

          <ResumeExperience
            workExperience={resumeData.workExperience}
            section={experienceSection}
          />

          <ResumeSection {...openSourceSection}>
            <ul className="grid gap-6">
              {resumeData.openSource.map((contribution) => (
                <li key={contribution.title} className="grid gap-1">
                  <time className="text-[12px] text-neutral-500 tabular-nums">
                    {contribution.period}
                  </time>
                  <h3 className="text-[14.5px] font-semibold text-neutral-950">
                    {contribution.title}{" "}
                    <ExternalLink
                      href={contribution.link}
                      className="font-normal underline underline-offset-2"
                    >
                      기여
                    </ExternalLink>
                  </h3>
                  <p className="text-[14px] leading-[1.65] text-neutral-700">
                    {contribution.description}
                  </p>
                  {"blogLink" in contribution && contribution.blogLink ? (
                    <p className="text-[14px]">
                      <ExternalLink
                        href={contribution.blogLink}
                        className="underline underline-offset-2"
                      >
                        {contribution.blogLinkText}
                      </ExternalLink>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </ResumeSection>

          <ResumeSection {...otherExperienceSection}>
            <ul className="grid gap-6">
              {resumeData.otherExperience.map((item) => (
                <li key={item.title} className="grid gap-1.5">
                  <time className="text-[12px] text-neutral-500 tabular-nums">
                    {item.period}
                  </time>
                  <h3 className="text-[14.5px] font-semibold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="text-[14px] leading-[1.65] text-neutral-700">
                    {item.description}
                  </p>
                  <ul className="grid gap-1 text-[14px] leading-[1.65] text-neutral-700">
                    {item.details.map((detail) => (
                      <li key={detail} className="relative pl-3.5">
                        <span
                          className="absolute top-[0.6em] left-0 size-1 rounded-full bg-neutral-400"
                          aria-hidden
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </ResumeSection>

          <ResumeSection {...educationSection}>
            <ul className="grid gap-4">
              {resumeData.education.map((edu) => (
                <li key={edu.school} className="grid gap-1">
                  <time className="text-[12px] text-neutral-500 tabular-nums">
                    {edu.period}
                  </time>
                  <div className="text-[14.5px] font-semibold text-neutral-950">
                    {edu.school}
                  </div>
                </li>
              ))}
            </ul>
          </ResumeSection>
        </div>
      </div>
    </main>
  );
};

export default page;
