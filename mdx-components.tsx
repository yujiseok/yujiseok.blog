import type { MDXComponents } from "mdx/types";
import dynamic from "next/dynamic";
import Image from "next/image";

import { cn } from "@/lib/cn";

import ExternalLink from "@/app/_components/external-link";
import CodeBlock from "@/app/_mdx/code-block";
import { Callout } from "@/app/_mdx/callout";
import { LocalizedLink } from "@/app/_mdx/localized-link";

// 24개 글 중 2~4개만 쓰는 클라이언트 컴포넌트다(그중 셋은 motion/react까지
// 끌고 온다). mdx-components.tsx는 모든 글의 렌더 경로에 걸리므로, 정적
// import는 이 컴포넌트들을 안 쓰는 글의 클라이언트 번들에도 실어 보낸다.
// next/dynamic으로 바꿔 실제로 렌더되는 글에서만 청크가 로드되게 한다.
// 다섯 다 SSR을 못 할 이유가 없어(Meteor의 useLayoutEffect도 초기 렌더는
// 빈 배열이라 서버에서 그대로 그려진다) ssr:false는 쓰지 않는다.
const GenconTypewriter = dynamic(() => import("@/app/_mdx/gencon-typewriter"));
const AtelierTypewriter = dynamic(
  () => import("@/app/_mdx/atelier/typewriter"),
);
const GridMasonry = dynamic(() => import("@/app/_mdx/grid-masonry"));
const ShowCase = dynamic(() => import("@/app/_mdx/atelier/show-case"));
const Meteor = dynamic(() => import("@/app/_mdx/atelier/meteor"));

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href ?? "";

  if (href.startsWith("/")) {
    return <LocalizedLink {...props} href={href} />;
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
      // 본문 칼럼은 max-w-2xl(672px) 고정폭이다. sizes가 없으면 next/image가
      // 뷰포트 폭 기준으로 최대 3840w까지 서빙해 672px짜리 슬롯에 그보다
      // 몇 배 큰 원본을 흘려보낸다. 개별 이미지가 sizes를 명시하면(props가
      // 뒤에 스프레드되므로) 이 기본값을 덮어쓴다.
      sizes="(max-width: 672px) 100vw, 672px"
      {...props}
      className={cn(IMAGE_ALIGN_CLASS[align ?? "center"], "rounded-md")}
    />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: CustomLink,
    pre: CodeBlock,
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
