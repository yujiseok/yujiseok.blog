import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { getAllWritings, getWritingBySlug } from "@/lib/utils";
import { Mdx } from "@/app/components/mdx";
import BlurContainer from "@/app/components/blurContainer";
import { SITE_URL } from "@/lib/constants";

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
  const writing = getWritingBySlug(slug);

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
      url: `${SITE_URL}/writing/${writing.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const Post = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const writing = getWritingBySlug(params.slug);
  if (!writing) {
    notFound();
  }

  return (
    <BlurContainer className="block gap-0">
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

    </BlurContainer>
  );
};
export default Post;
