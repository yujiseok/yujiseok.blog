import {
  PAGE_BOTTOM,
  PAGE_TOP,
  PAGE_WIDTH,
} from "@/app/_components/page-spacing";
import { getResume, resolveResume, resumePdfHref } from "./resolve";
import ResumeProfile from "./_components/resume-profile";
import {
  EducationSection,
  ExperienceSection,
  OpenSourceSection,
  OtherExperienceSection,
} from "./_components/resume-sections";
import { pageMetadata } from "@/lib/metadata";
import { getTranslatedSlugs } from "@/lib/content/repository";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";

export async function generateMetadata({ params }: LocaleParams) {
  const locale = await requireLocale(params);
  const { profile } = getResume(locale);
  const { resume } = getDictionary(locale);
  const title = `${profile.name} | ${profile.title}`;

  return {
    // 이름이 곧 사이트 이름이라 레이아웃 템플릿("%s | Yujiseok")을 붙이면 중복된다.
    ...pageMetadata({
      locale,
      path: "/resume",
      title: { absolute: title },
      description: profile.introduction[0],
      og: {
        title,
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
    }),
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
        <ExperienceSection workExperience={resumeData.workExperience} />
        <OpenSourceSection openSource={resumeData.openSource} />
        <OtherExperienceSection otherExperience={resumeData.otherExperience} />
        <EducationSection education={resumeData.education} />
      </section>
    </main>
  );
};

export default page;
