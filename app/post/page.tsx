import { getAllPosts } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Post",
  description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
};

function PostPage() {
  const posts = getAllPosts();

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Post</h1>
      {posts.map(({ metadata, slug }) => (
        <article key={slug} className="mb-6">
          <Link href={`/post/${slug}`}>
            <h2 className="text-xl font-semibold">{metadata.title}</h2>
            <h6 className="my-1 text-sm font-normal text-gray-400">
              {metadata.summary}
            </h6>
            <p>
              <small className="mr-2">{metadata.publishedAt}</small>
            </p>
          </Link>
        </article>
      ))}
    </section>
  );
}
export default PostPage;
