import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

import ExternalLink from "@/app/components/externalLink";
import GenconTypewriter from "@/app/components/2024-gencon/typewriter";
import AtelierTypewriter from "@/app/components/atelier/typewriter";
import GridMasonry from "@/app/components/portfolio/GridMasonry";
import { Callout } from "@/app/components/callout";
import ShowCase from "@/app/components/atelier/showCase";
import Meteor from "@/app/components/atelier/meteor";

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

  return <ExternalLink {...props} />;
}

interface CustomImageProps extends Omit<
  React.ComponentProps<typeof Image>,
  "width" | "height"
> {
  width?: string | number;
  height?: string | number;
}

function CustomImage({ width, height, ...props }: CustomImageProps) {
  const w = Number(width) || 768;
  const h = Number(height) || 400;

  return (
    <Image width={w} height={h} {...props} className="mx-auto rounded-md" />
  );
}

// content/atelier/typewriter.mdx는 text를 넘기고, content/writing/2024-gencon.mdx는 넘기지 않는다.
// 두 글이 같은 <Typewriter> 이름을 쓰므로 prop 유무로 분기한다.
function Typewriter({
  text,
  ...props
}: Partial<React.ComponentProps<typeof AtelierTypewriter>>) {
  if (!text) return <GenconTypewriter />;

  return <AtelierTypewriter text={text} {...props} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: CustomLink,
    Image: CustomImage as MDXComponents["img"],
    Typewriter,
    GridMasonry,
    Callout,
    ShowCase,
    Meteor,
    ...components,
  };
}
