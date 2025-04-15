import AtelierMdx from "@/app/components/atelier/atelierMdx";
import { getAllAtelier } from "@/lib/utils";
import { Metadata } from "next";

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
  };
};

const page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const atelier = getAllAtelier().find(
    (atelier) => atelier.slug === params.slug,
  );
  if (!atelier) {
    return false;
  }

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

      <AtelierMdx source={atelier.content} />
    </section>
  );
};
export default page;
