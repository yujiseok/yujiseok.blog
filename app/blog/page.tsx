import type { Metadata } from "next";
import { allBlogs } from "contentlayer/generated";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
};

function BlogPage() {
  return (
    <section>
      <h1 className="mb-5 text-3xl font-bold">Blog</h1>

      {allBlogs
        .sort((a, b) => {
          if (new Date(a.publishedAt) > new Date(b.publishedAt)) return -1;

          return 1;
        })
        .map((blog) => (
          <article key={blog.slug} className="mb-4">
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="text-xl font-semibold">{blog.title}</h3>
              <h6 className="font-light text-gray-500">{blog.summary}</h6>
              <p>
                <small className="mr-2">{blog.publishedAt}</small>
                <small>{blog.readingTime.text}</small>
              </p>
            </Link>
          </article>
        ))}
    </section>
  );
}
export default BlogPage;
