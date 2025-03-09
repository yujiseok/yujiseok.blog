import BlurContainer from "@/app/components/blurContainer";
import Post from "@/app/components/post";
import { getAllPosts } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post",
  description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
};

function PostPage() {
  const posts = getAllPosts();

  return (
    <BlurContainer>
      {posts.map(({ metadata, slug }, i) => (
        <Post key={slug} metadata={metadata} slug={slug} index={i} />
      ))}
    </BlurContainer>
  );
}
export default PostPage;
