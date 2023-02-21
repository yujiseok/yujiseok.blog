import type { Metadata } from "next";
import { allPosts } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import Balancer from "react-wrap-balancer";

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }
  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    slug,
  } = post;

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

const Post = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) {
    return false;
  }
  const MDXContent = useMDXComponent(post.body.code);

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">
          <Balancer>{post.title}</Balancer>
        </h1>
        <h4 className="font-light text-gray-700 dark:text-gray-400">
          {post.summary}
        </h4>
        <p>
          <small>{post.publishedAt}</small>{" "}
          <small>{post.readingTime.text}</small>
        </p>
      </div>

      <article className="prose break-keep dark:prose-invert prose-h1:text-2xl">
        <MDXContent />
      </article>
    </section>
  );
};
export default Post;
