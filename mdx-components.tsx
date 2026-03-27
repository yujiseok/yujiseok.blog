import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

import Typewriter from "@/app/components/2024-gencon/typewriter";
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

  return <a target="_blank" rel="noreferrer" {...props} />;
}

interface CustomImageProps
  extends Omit<React.ComponentProps<typeof Image>, "width" | "height"> {
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
