"use client";

import { HTMLMotionProps, Variants, motion } from "motion/react";

interface TypewriterProps extends HTMLMotionProps<"div"> {
  text: string;
  as?: "div" | "span" | "p" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

const Typewriter = ({
  text,
  as = "div",
  className,
  ...props
}: TypewriterProps) => {
  const MotionComponent = motion[as] as React.ElementType;

  return (
    <MotionComponent
      variants={sentenceVariants}
      className={className}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {text.split("").map((char, i) => (
        <motion.span key={`${char}-${i}`} variants={charVariants}>
          {char}
        </motion.span>
      ))}
    </MotionComponent>
  );
};

export default Typewriter;

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
  visible: { opacity: 1, transition: { opacity: { duration: 0.025 } } },
};
