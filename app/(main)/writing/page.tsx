import BlurContainer from "@/app/components/blurContainer";
import Writing from "@/app/components/writing";
import { getAllWritings } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post",
  description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
};

function PostPage() {
  const writings = getAllWritings();

  return (
    <BlurContainer className="gap-8">
      {writings.map(({ metadata, slug }) => (
        <Writing key={slug} metadata={metadata} slug={slug} />
      ))}
    </BlurContainer>
  );
}
export default PostPage;
