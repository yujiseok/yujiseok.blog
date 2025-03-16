import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import rehypePrettyCode, { Options } from "rehype-pretty-code";
import Typewriter from "./2024-gencon/typewriter";

function CustomLink(props: any) {
  const href = props.href;

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

function CustomImage(props: any) {
  return (
    <Image alt={props.alt} {...props} className="mx-auto rounded-md" priority />
  );
}

const mdxComponents = {
  a: CustomLink,
  Image: CustomImage,
  Typewriter,
};

const options: Options = {
  theme: "material-theme-palenight",
};

export function Mdx({ components, source }: any) {
  return (
    <article className="prose dark:prose-invert prose-h1:text-2xl prose-a:break-all max-w-3xl break-keep">
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
