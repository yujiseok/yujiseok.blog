import { notFound } from "next/navigation";
import {
  getAllAtelier,
  getAtelierBySlug,
  importMdx,
} from "@/lib/content/repository";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { requireLocale } from "@/lib/i18n/params";
import { LOCALES, localizedPath } from "@/lib/i18n/locales";
import { alternates, siteOg } from "@/lib/metadata";

type AtelierSlugParams = { params: Promise<{ locale: string; slug: string }> };

// atelier는 번역 대상이 아니라 두 언어 모두 같은 원문을 보여준다
export const generateStaticParams = async () => {
  const atelier = await getAllAtelier();

  return LOCALES.flatMap((locale) =>
    atelier.map(({ slug }) => ({ locale, slug })),
  );
};

export const generateMetadata = async (
  props: AtelierSlugParams,
): Promise<Metadata | undefined> => {
  const locale = await requireLocale(props.params);
  const { slug } = await props.params;
  const atelier = await getAtelierBySlug(slug);

  if (!atelier) {
    return;
  }

  return {
    title: atelier.metadata.title,
    description: atelier.metadata.summary,
    alternates: alternates(locale, `/atelier/${slug}`),
    openGraph: {
      title: { absolute: atelier.metadata.title },
      description: atelier.metadata.summary,
      type: "article",
      url: `${SITE_URL}${localizedPath(locale, `/atelier/${slug}`)}`,
      ...siteOg(locale),
    },
  };
};

const page = async (props: AtelierSlugParams) => {
  const locale = await requireLocale(props.params);
  const params = await props.params;
  const atelier = await getAtelierBySlug(params.slug);
  if (!atelier) {
    notFound();
  }

  const { default: Content } = await importMdx("atelier", params.slug, locale);

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
