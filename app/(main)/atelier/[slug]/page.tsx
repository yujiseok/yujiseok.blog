import { notFound } from "next/navigation";
import { getAllAtelier } from "@/lib/utils";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const generateStaticParams = async () => {
  const atelier = getAllAtelier();
  return atelier.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> => {
  const { slug } = await props.params;
  const atelier = getAllAtelier().find((atelier) => atelier.slug === slug);

  if (!atelier) {
    return;
  }

  return {
    title: atelier.metadata.title,
    description: atelier.metadata.summary,
    alternates: {
      canonical: `/atelier/${slug}`,
    },
    openGraph: {
      title: { absolute: atelier.metadata.title },
      description: atelier.metadata.summary,
      type: "article",
      url: `${SITE_URL}/atelier/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: atelier.metadata.title,
      description: atelier.metadata.summary,
    },
  };
};

async function importMdx(slug: string) {
  try {
    return await import(`@/content/atelier/${slug}.mdx`);
  } catch {
    return null;
  }
}

const page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const atelier = getAllAtelier().find(
    (atelier) => atelier.slug === params.slug,
  );
  if (!atelier) {
    notFound();
  }

  const mdxModule = await importMdx(params.slug);
  if (!mdxModule) {
    notFound();
  }

  const Content = mdxModule.default;

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold">
          {atelier.metadata.title}
        </h1>
        <time className="text-sm text-neutral-600 dark:text-neutral-400">
          {atelier.metadata.publishedAt}
        </time>
      </div>

      <article className="prose dark:prose-invert prose-h1:text-2xl prose-a:break-all max-w-2xl break-keep">
        <Content />
      </article>
    </section>
  );
};
export default page;
