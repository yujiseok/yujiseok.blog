import GridItem from "@/app/components/atelier/gridItem";
import BlurContainer from "@/app/components/blurContainer";
import { getAllAtelier } from "@/lib/utils";

export const metadata = {
  title: "Atelier",
  description: "인터페이스를 탐구하는 공간",
};

const page = () => {
  const atelier = getAllAtelier();

  return (
    <BlurContainer className="grid-cols-2 gap-4">
      {atelier.map(({ metadata, slug }) => (
        <GridItem key={slug} metadata={metadata} slug={slug} />
      ))}
    </BlurContainer>
  );
};
export default page;
