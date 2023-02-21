import type { Metadata } from "next";
import { allPosts } from "contentlayer/generated";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Post",
  description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
};

function PostPage() {
  return (
    <section>
      <h1 className="mb-5 text-3xl font-bold">Post</h1>

      {allPosts
        .sort((a, b) => {
          if (new Date(a.publishedAt) > new Date(b.publishedAt)) return -1;

          return 1;
        })
        .map((post) => (
          <article key={post.slug} className="mb-4">
            <Link href={`/post/${post.slug}`}>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <h6 className="font-light text-gray-500">{post.summary}</h6>
              <p>
                <small className="mr-2">{post.publishedAt}</small>
              </p>
            </Link>
          </article>
        ))}
    </section>
  );
}
export default PostPage;
