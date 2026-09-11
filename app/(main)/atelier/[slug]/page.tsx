import { notFound } from "next/navigation";
import {
  getAllAtelier,
  getAtelierBySlug,
  importMdx,
} from "@/lib/content/repository";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { alternates, SITE_OG } from "@/lib/metadata";

export const generateStaticParams = async () => {
  const atelier = await getAllAtelier();
  return atelier.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> => {
  const { slug } = await props.params;
  const atelier = await getAtelierBySlug(slug);

  if (!atelier) {
    return;
  }

  return {
    title: atelier.metadata.title,
    description: atelier.metadata.summary,
    alternates: alternates(`/atelier/${slug}`),
    openGraph: {
      title: { absolute: atelier.metadata.title },
      description: atelier.metadata.summary,
      type: "article",
      url: `${SITE_URL}/atelier/${slug}`,
      ...SITE_OG,
    },
  };
};

const page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const atelier = await getAtelierBySlug(params.slug);
  if (!atelier) {
    notFound();
  }

  const { default: Content } = await importMdx("atelier", params.slug);

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
