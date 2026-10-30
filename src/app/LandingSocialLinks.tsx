"use client";

import { motion, useScroll, useTransform } from "motion/react";
import SocialLinks from "@/components/SocialLinks/SocialLinks";
import styles from "./page.module.css";

// Scroll distance over which the icons fade out.
const FADE_DISTANCE = 120;

/** Landing-page social icons: shown at the top of the page, gone once you scroll. */
export default function LandingSocialLinks() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, FADE_DISTANCE], [1, 0]);
  const visibility = useTransform(scrollY, (y) => (y >= FADE_DISTANCE ? "hidden" : "visible"));

  return (
    <motion.div className={styles.social} style={{ opacity, visibility }}>
      <SocialLinks />
    </motion.div>
  );
}
