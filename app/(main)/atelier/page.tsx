import GridItem from "@/app/components/atelier/gridItem";
import BlurContainer from "@/app/components/blurContainer";
import FixedBackLink from "@/app/components/fixedBackLink";
import { getAllAtelier } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { alternates, SITE_OG } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Atelier",
  description: "인터페이스를 탐구하는 공간",
  alternates: alternates("/atelier"),
  openGraph: {
    title: "Atelier",
    description: "인터페이스를 탐구하는 공간",
    url: `${SITE_URL}/atelier`,
    type: "website",
    ...SITE_OG,
  },
};

const page = async () => {
  const atelier = await getAllAtelier();

  return (
    <>
      <FixedBackLink href="/" />
      <BlurContainer className="grid-cols-2 gap-2 md:gap-4">
        {atelier.map(({ metadata, slug }) => (
          <GridItem key={slug} metadata={metadata} slug={slug} />
        ))}
      </BlurContainer>
    </>
  );
};
export default page;
