import GridItem from "@/app/[locale]/(main)/atelier/_components/grid-item";
import BlurContainer from "@/app/_components/blur-container";
import { getAllAtelier } from "@/lib/content/repository";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";
import { localizedPath } from "@/lib/i18n/locales";
import { alternates, siteOg } from "@/lib/metadata";

export const generateMetadata = async ({
  params,
}: LocaleParams): Promise<Metadata> => {
  const locale = await requireLocale(params);
  const description = getDictionary(locale).atelier.description;

  return {
    title: "Atelier",
    description,
    alternates: alternates(locale, "/atelier"),
    openGraph: {
      title: "Atelier",
      description,
      url: `${SITE_URL}${localizedPath(locale, "/atelier")}`,
      type: "website",
      ...siteOg(locale),
    },
  };
};

const page = async ({ params }: LocaleParams) => {
  const locale = await requireLocale(params);
  const atelier = await getAllAtelier();

  return (
    <>
      <BlurContainer className="grid-cols-2 gap-2 md:gap-4">
        {atelier.map(({ metadata, slug }) => (
          <GridItem
            key={slug}
            metadata={metadata}
            slug={slug}
            locale={locale}
          />
        ))}
      </BlurContainer>
    </>
  );
};
export default page;
