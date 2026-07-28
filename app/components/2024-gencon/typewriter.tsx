"use client";
import { cn } from "@/lib/cn";
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

export const sentenceVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.025, type: "spring" },
  },
};

export const charVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { opacity: { duration: 0.1 } } },
};

const TypewriterWrapper = () => {
  const { ref, isVisible } = useInViewAnimation(0.5);

  return (
    <div
      data-lenis-prevent
      className="max-h-40 overflow-y-auto overscroll-contain rounded-md border p-4"
    >
      <Typewriter
        as="div"
        text="안녕하세요. 저의 젠콘 개발 회고는 재밌게 읽고 계신가요? 해당 컴포넌트는 뷰포트에 상관없이 보여요. 만약 뷰포트에 따라 보여지길 원하신다면, framer-motion의 useInView 훅을 사용해 구현할 수 있습니다. 💫"
        className="pb-16"
        isVisible={true}
      />
      <Typewriter
        as="p"
        ref={ref}
        isVisible={isVisible}
        text="해당 타입라이터는 뷰포트에 따라 보여지는 기능을 가지고 있습니다. 뷰포트에 요소가 보이면 애니메이션이 시작됩니다. 스크롤 해보세요! 🤘 또한 `as` prop을 통해 p태그로 렌더링 되었답니다."
      />
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
