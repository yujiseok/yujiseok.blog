import { useMDXComponent } from "next-contentlayer/hooks";
import Image from "next/image";
import Link from "next/link";

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

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function CustomImage(props: any) {
  return <Image alt={props.alt} {...props} className="rounded-md" />;
}

const components = {
  a: CustomLink,
  Image: CustomImage,
};

export function Mdx({ code }: { code: string }) {
  const Component = useMDXComponent(code);

  return (
    <article className="prose break-keep dark:prose-invert prose-h1:text-2xl prose-a:break-all">
      <Component components={{ ...components }} />
    </article>
  );
}
