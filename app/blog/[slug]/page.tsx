import type { Metadata } from "next";
import { allBlogs } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import Balancer from "react-wrap-balancer";

export async function generateStaticParams() {
  return allBlogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const blog = allBlogs.find((blog) => blog.slug === params.slug);
  if (!blog) {
    return;
  }
  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    slug,
  } = blog;

  return {
    title,
    description,
    openGraph: {
      title: { absolute: title },
      description,
      type: "article",
      publishedTime,
      url: `https://www.yujiseok.blog/blog/${slug}`,
    },
  };
}

const Blog = ({ params }: { params: { slug: string } }) => {
  const blog = allBlogs.find((blog) => blog.slug === params.slug);
  if (!blog) {
    return false;
  }
  const MDXContent = useMDXComponent(blog.body.code);

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">
          <Balancer>{blog.title}</Balancer>
        </h1>
        <h4 className="font-light text-gray-700">{blog.summary}</h4>
        <p>
          <small>{blog.publishedAt}</small>{" "}
          <small>{blog.readingTime.text}</small>
        </p>
      </div>

      <article className="prose break-keep dark:prose-invert prose-h1:text-2xl">
        <MDXContent />
      </article>
    </section>
  );
};
export default Blog;
