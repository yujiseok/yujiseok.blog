"use client";
import { useLocaleContext } from "@/app/_components/locale-provider";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/locales";
import { HTMLMotionProps, motion, Variants, useInView } from "motion/react";
import { useRef } from "react";

type TypewriterTags = "p" | "span" | "div" | "h2";

interface TypewriterProps extends HTMLMotionProps<"p"> {
  as?: TypewriterTags;
  text: string;
  className?: string;
  isVisible?: boolean;
}

const useInViewAnimation = (amount = 1) => {
  const ref = useRef(null);
  const isVisible = useInView(ref, {
    amount,
  });

  return { ref, isVisible };
};

const sentenceVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.025, type: "spring" },
  },
};

const charVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { opacity: { duration: 0.1 } } },
};

// 번역 스크립트는 컴포넌트 안의 문구를 볼 수 없어 언어별로 직접 둔다
const COPY = {
  ko: {
    always:
      "안녕하세요. 저의 젠콘 개발 회고는 재밌게 읽고 계신가요? 해당 컴포넌트는 뷰포트에 상관없이 보여요. 만약 뷰포트에 따라 보여지길 원하신다면, framer-motion의 useInView 훅을 사용해 구현할 수 있습니다. 💫",
    inView:
      "해당 타입라이터는 뷰포트에 따라 보여지는 기능을 가지고 있습니다. 뷰포트에 요소가 보이면 애니메이션이 시작됩니다. 스크롤 해보세요! 🤘 또한 `as` prop을 통해 p태그로 렌더링 되었답니다.",
  },
  en: {
    always:
      "Hello. Are you enjoying my GenCon development retrospective? This component shows up regardless of the viewport. If you want it to appear based on the viewport, you can build that with framer-motion's useInView hook. 💫",
    inView:
      "This typewriter appears based on the viewport. The animation starts once the element comes into view. Try scrolling! 🤘 It's also rendered as a p tag through the `as` prop.",
  },
} as const satisfies Record<Locale, { always: string; inView: string }>;

const TypewriterWrapper = () => {
  const { ref, isVisible } = useInViewAnimation(0.5);
  const copy = COPY[useLocaleContext().locale];

  return (
    <div
      data-lenis-prevent
      className="max-h-40 overflow-y-auto overscroll-contain rounded-md border p-4"
    >
      <Typewriter
        as="div"
        text={copy.always}
        className="pb-16"
        isVisible={true}
      />
      <Typewriter as="p" ref={ref} isVisible={isVisible} text={copy.inView} />
    </div>
  );
};

const Typewriter = ({
  as = "h2",
  text,
  className,
  ref,
  isVisible,
  ...props
}: TypewriterProps) => {
  const MotionComponent = motion[as] as React.ElementType;

  return (
    <MotionComponent
      key={text}
      variants={sentenceVariants}
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={cn(
        "break-keep whitespace-pre-line will-change-auto",
        className,
      )}
      {...props}
    >
      {renderCharacters(text)}
    </MotionComponent>
  );
};

const renderCharacters = (text: string) =>
  Array.from(text).map((char, i) => (
    <motion.span key={`${char}-${i}`} variants={charVariants}>
      {char}
    </motion.span>
  ));

export default TypewriterWrapper;
