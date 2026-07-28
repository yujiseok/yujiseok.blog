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

function CustomImage(props: React.ComponentProps<typeof Image>) {
  return <Image {...props} className="mx-auto rounded-md" />;
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
