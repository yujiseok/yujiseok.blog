"use client";
import { motion, Variants } from "motion/react";

const PostContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6"
    >
      {children}
    </motion.section>
  );
};

export default PostContainer;

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
