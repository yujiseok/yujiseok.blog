import BlurContainer from "@/app/components/blurContainer";
import FixedBackLink from "@/app/components/fixedBackLink";
import Writing from "@/app/components/writing";
import { getAllWritings } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { alternates, SITE_OG } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Writing",
  description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
  alternates: alternates("/writing"),
  openGraph: {
    title: "Writing",
    description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
    url: `${SITE_URL}/writing`,
    type: "website",
    ...SITE_OG,
  },
};

async function PostPage() {
  const writings = await getAllWritings();

  return (
    <>
      <FixedBackLink href="/" />
      <BlurContainer className="gap-8">
        {writings.map(({ metadata, slug }) => (
          <Writing key={slug} metadata={metadata} slug={slug} />
        ))}
      </BlurContainer>
    </>
  );
}
export default PostPage;
