import Link from "next/link";
import Image from "next/image";
import type { PostMetadata } from "@/lib/content/document";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

const GridItem = ({
  metadata,
  slug,
  locale,
}: {
  metadata: PostMetadata;
  slug: string;
  locale: Locale;
}) => {
  const { title, image } = metadata;

  return (
    <Link
      href={localizedPath(locale, `/atelier/${slug}`)}
      className="rounded-lg border border-neutral-300/80 p-px dark:border-neutral-700"
    >
      <div className="grid gap-2 p-1">
        {image && (
          <Image
            src={image}
            alt={title}
            width={320}
            height={180}
            quality={100}
            className="size-full object-cover"
          />
        )}
        <h3 className="text-xs font-normal md:text-sm">{title}</h3>
      </div>
    </Link>
  );
};

export default GridItem;
