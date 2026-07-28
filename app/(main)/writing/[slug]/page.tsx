import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { getAllWritings, getWritingBySlug, importMdx } from "@/lib/utils";
import BlurContainer from "@/app/components/blurContainer";
import { SITE_URL } from "@/lib/constants";
import { alternates, SITE_OG } from "@/lib/metadata";

export async function generateStaticParams() {
  const writings = await getAllWritings();

  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await props.params;
  const writing = await getWritingBySlug(slug);

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
    alternates: alternates(`/writing/${writing.slug}`),
    openGraph: {
      title: { absolute: title },
      description,
      type: "article",
      publishedTime,
      url: `${SITE_URL}/writing/${writing.slug}`,
      ...SITE_OG,
    },
  };
}

const Post = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const writing = await getWritingBySlug(params.slug);
  if (!writing) {
    notFound();
  }

  const { default: Content } = await importMdx("writing", params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: writing.metadata.title,
    description: writing.metadata.summary,
    datePublished: writing.metadata.publishedAt,
    url: `${SITE_URL}/writing/${params.slug}`,
    author: {
      "@type": "Person",
      name: "유지석",
      url: SITE_URL,
    },
  };

  return (
    <BlurContainer className="block gap-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // 제목에 </script>가 들어가면 스크립트가 조기 종료된다
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold">
          {writing.metadata.title}
        </h1>
        <h4 className="text-gray-700 dark:text-gray-400">
          {writing.metadata.summary}
        </h4>
        <small>{writing.metadata.publishedAt}</small>
      </div>

      <article className="prose dark:prose-invert prose-h1:text-2xl prose-a:break-all max-w-2xl break-keep">
        <Content />
      </article>
    </BlurContainer>
  );
};
export default Post;
