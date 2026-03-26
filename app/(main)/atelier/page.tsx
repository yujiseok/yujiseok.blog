import GridItem from "@/app/components/atelier/gridItem";
import BlurContainer from "@/app/components/blurContainer";
import { getAllAtelier } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier",
  description: "인터페이스를 탐구하는 공간",
  alternates: {
    canonical: "/atelier",
  },
  openGraph: {
    title: "Atelier",
    description: "인터페이스를 탐구하는 공간",
    url: `${SITE_URL}/atelier`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier",
    description: "인터페이스를 탐구하는 공간",
  },
};

const page = () => {
  const atelier = getAllAtelier();

  return (
    <BlurContainer className="grid-cols-2 gap-2 md:gap-4">
      {atelier.map(({ metadata, slug }) => (
        <GridItem key={slug} metadata={metadata} slug={slug} />
      ))}
    </BlurContainer>
  );
};
export default page;
