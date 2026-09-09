import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

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

// 에디터가 붙이는 align prop. 없으면 가운데 — 이미 발행된 74곳의 이미지가
// 지금과 똑같이(mx-auto rounded-md) 그려져야 한다.
const IMAGE_ALIGN_CLASS = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
} as const;

type ImageAlign = keyof typeof IMAGE_ALIGN_CLASS;

interface CustomImageProps extends React.ComponentProps<typeof Image> {
  align?: ImageAlign;
}

function CustomImage({ align, ...props }: CustomImageProps) {
  return (
    <Image
      {...props}
      className={cn(IMAGE_ALIGN_CLASS[align ?? "center"], "rounded-md")}
    />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: CustomLink,
    Image: CustomImage as MDXComponents["img"],
    Typewriter: AtelierTypewriter,
    GenconTypewriter,
    GridMasonry,
    Callout,
    ShowCase,
    Meteor,
    ...components,
  };
}
