import type { Metadata } from "next";

import { Mdx } from "@/components/mdx";
import { getAllPosts } from "@/lib/utils";

export function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = getAllPosts().find((post) => post.slug === params.slug);

  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  return {
    title,
    description,
    openGraph: {
      title: { absolute: title },
      description,
      type: "article",
      publishedTime,
      url: `https://www.yujiseok.blog/post/${post.slug}`,
    },
  };
}

const Post = ({ params }: { params: { slug: string } }) => {
  const post = getAllPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return false;
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">
          <>{post.metadata.title}</>
        </h1>
        <h4 className="font-light text-gray-700 dark:text-gray-400">
          {post.metadata.summary}
        </h4>
        <p>
          <small>{post.metadata.publishedAt}</small>{" "}
          {/* <small>{post.readingTime.text}</small> */}
        </p>
      </div>

      <Mdx source={post.content} />
    </section>
  );
};
export default Post;
