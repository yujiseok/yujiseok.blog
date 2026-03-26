import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import rehypePrettyCode, { Options } from "rehype-pretty-code";

import Typewriter from "./2024-gencon/typewriter";
import GridMasonry from "./portfolio/GridMasonry";
import { Callout } from "./callout";

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href ?? "";

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noreferrer" {...props} />;
}

interface CustomImageProps extends Omit<React.ComponentProps<typeof Image>, 'width' | 'height'> {
  width?: string | number;
  height?: string | number;
}

function CustomImage({ width, height, ...props }: CustomImageProps) {
  const w = Number(width) || 768;
  const h = Number(height) || 400;

  return (
    <Image
      width={w}
      height={h}
      {...props}
      className="mx-auto rounded-md"
      priority
    />
  );
}


const mdxComponents = {
  a: CustomLink,
  Image: CustomImage,
  Typewriter,
  GridMasonry,
  Callout,
};

const options: Options = {
  theme: "poimandres",
};

interface MdxProps {
  components?: Record<string, React.ComponentType>;
  source: string;
}

export async function Mdx({ components, source }: MdxProps) {
  "use cache";

  return (
    <article className="prose dark:prose-invert prose-h1:text-2xl prose-a:break-all max-w-2xl break-keep">
      <MDXRemote
        source={source}
        components={{ ...mdxComponents, ...(components || {}) }}
        options={{
          mdxOptions: {
            rehypePlugins: [[rehypePrettyCode, options]],
          },
        }}
      />
    </article>
  );
}
