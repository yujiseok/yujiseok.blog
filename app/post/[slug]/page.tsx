import type { Metadata } from "next";

import { getAllPosts } from "@/lib/utils";
import { Mdx } from "@/app/components/mdx";

export function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await props.params;
  const post = getAllPosts().find((post) => post.slug === slug);

  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
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

const Post = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const post = getAllPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return false;
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">{post.metadata.title}</h1>
        <h4 className="text-gray-700 dark:text-gray-400">
          {post.metadata.summary}
        </h4>
        <small>{post.metadata.publishedAt}</small>
      </div>

      <Mdx source={post.content} />
    </section>
  );
};
export default Post;
