import type { Metadata } from "next";

import { getAllWritings } from "@/lib/utils";
import { Mdx } from "@/app/components/mdx";

export function generateStaticParams() {
  const writings = getAllWritings();

  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await props.params;
  const writing = getAllWritings().find((writing) => writing.slug === slug);

  if (!writing) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
  } = writing.metadata;

  return {
    title,
    description,
    openGraph: {
      title: { absolute: title },
      description,
      type: "article",
      publishedTime,
      url: `https://www.yujiseok.blog/writing/${writing.slug}`,
    },
  };
}

const Post = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const writing = getAllWritings().find(
    (writing) => writing.slug === params.slug,
  );
  if (!writing) {
    return false;
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">
          {writing.metadata.title}
        </h1>
        <h4 className="text-gray-700 dark:text-gray-400">
          {writing.metadata.summary}
        </h4>
        <small>{writing.metadata.publishedAt}</small>
      </div>

      <Mdx source={writing.content} />
    </section>
  );
};
export default Post;
