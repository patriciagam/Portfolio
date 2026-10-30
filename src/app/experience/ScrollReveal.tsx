"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  /** Page scroll progress (0-1) over which the content fades in. */
  range: [number, number];
  className?: string;
};

/**
 * Fades content in as the page scrolls. Uses the same document scroll
 * progress as the timeline line and nav underline, so it stays in step.
 */
export default function ScrollReveal({ children, range, className }: ScrollRevealProps) {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const opacity = useTransform(scrollYProgress, range, [0, 1]);

  return (
    <motion.div className={className} style={reduceMotion ? undefined : { opacity }}>
      {children}
    </motion.div>
  );
}
