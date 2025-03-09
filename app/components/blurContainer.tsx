"use client";
import { cn } from "@/lib/cn";
import { motion, Variants } from "motion/react";

const BlurContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("grid gap-6", className)}
    >
      {children}
    </motion.section>
  );
};

export default BlurContainer;

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -4,
    filter: "blur(1px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};
