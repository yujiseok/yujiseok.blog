import BlurContainer from "@/app/components/blurContainer";
import PostRow from "@/app/components/postRow";
import { getAllWritings } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { alternates, SITE_OG } from "@/lib/metadata";

const TITLE = "Posts";
const DESCRIPTION = "공유하고 싶은 생각 또는 기술들을 소개합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: alternates("/posts"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/posts`,
    type: "website",
    ...SITE_OG,
  },
};

async function PostPage() {
  const writings = await getAllWritings();

  return (
    <>
      <BlurContainer className="gap-4">
        {/* 목록 행의 글 제목이 h2다. h1이 없으면 계층이 비므로 크기가 아니라
            존재가 필요하다 — 라벨 크기로만 둔다. */}
        <h1 className="text-sm text-neutral-500 dark:text-neutral-400">
          {TITLE}
        </h1>

        <ul>
          {writings.map(({ metadata, slug }) => (
            <PostRow key={slug} metadata={metadata} slug={slug} />
          ))}
        </ul>
      </BlurContainer>
    </>
  );
}
export default PostPage;
