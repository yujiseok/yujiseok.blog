import GridItem from "@/app/[locale]/(main)/atelier/_components/grid-item";
import BlurContainer from "@/app/_components/blur-container";
import { getAllAtelier } from "@/lib/content/repository";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale } from "@/lib/i18n/params";
import { localizedPath } from "@/lib/i18n/locales";
import { alternates, siteOg } from "@/lib/metadata";

type AtelierParams = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({
  params,
}: AtelierParams): Promise<Metadata> => {
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

const page = async ({ params }: AtelierParams) => {
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
