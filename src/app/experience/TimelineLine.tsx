"use client";

import { motion, useScroll, useTransform } from "motion/react";
import styles from "./page.module.css";

// Geometry of the Figma "Line 2" asset (timeline-line.svg) once rotated
// upright. It is redrawn inline so the line and the ball can move separately;
// the exported asset is a single path.
const WIDTH = 10.6667;
const HEIGHT = 452.343;
const LINE_LENGTH = 447.01;
const BALL_RADIUS = 5.33333;
const LINE_X = 4.33333;
const LINE_THICKNESS = 2;

/** Vertical timeline line that fills top-to-bottom with page scroll progress. */
export default function TimelineLine() {
  // Same source as the nav underline fill, so the two stay in step.
  const { scrollYProgress } = useScroll();
  const ballY = useTransform(scrollYProgress, [0, 1], [-LINE_LENGTH, 0]);

  return (
    <div className={styles.line}>
      <svg
        className={styles.lineSvg}
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="timeline-line-gradient"
            x1="0"
            y1={LINE_LENGTH}
            x2="0"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8A38F5" />
            <stop offset="0.480769" stopColor="#BFA5FC" />
            <stop offset="1" stopColor="#13002F" />
          </linearGradient>
        </defs>
        {/* Faint track showing the full length before it fills. */}
        <rect
          className={styles.lineTrack}
          x={LINE_X}
          width={LINE_THICKNESS}
          height={LINE_LENGTH}
          fill="url(#timeline-line-gradient)"
        />
        <motion.rect
          x={LINE_X}
          width={LINE_THICKNESS}
          height={LINE_LENGTH}
          fill="url(#timeline-line-gradient)"
          style={{ scaleY: scrollYProgress, originY: 0 }}
        />
        <motion.circle
          cx={BALL_RADIUS}
          cy={LINE_LENGTH}
          r={BALL_RADIUS}
          fill="url(#timeline-line-gradient)"
          style={{ y: ballY }}
        />
      </svg>
    </div>
  );
}
