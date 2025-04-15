import Link from "next/link";
import { Metadata } from "@/lib/utils";
import Image from "next/image";

const GridItem = ({ metadata, slug }: { metadata: Metadata; slug: string }) => {
  const { title, image = "" } = metadata;

  return (
    <Link
      href={`/atelier/${slug}`}
      className="rounded-lg border border-neutral-300/80 p-px dark:border-neutral-700"
    >
      <div className="grid gap-2 p-1">
        <Image
          src={image}
          alt={title}
          width={320}
          height={180}
          quality={100}
          className="size-full object-cover"
        />
        <h3 className="text-xs font-normal md:text-sm">{title}</h3>
      </div>
    </Link>
  );
};

export default GridItem;
