"use client";

import { animate } from "motion/react";
import { useEffect } from "react";

// How far into the scroll track to glide on arrival, so the timeline isn't
// empty at first. At 1/3 the first role is (almost) fully shown.
const START_PROGRESS = 1 / 3;
// Lets Next.js finish its own scroll-to-top on navigation first.
const START_DELAY_MS = 150;
// A little slower than the browser's built-in smooth scroll.
const GLIDE_SECONDS = 1.1;

/** On entering the page, glides a third of the way down. */
export default function AutoScroll() {
  useEffect(() => {
    let stop: (() => void) | undefined;

    // Any input from the visitor cancels the glide so it doesn't fight them.
    const cancel = () => stop?.();
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) => window.addEventListener(type, cancel, { passive: true }));

    const timer = setTimeout(() => {
      if (window.scrollY > 0) return;
      const target = (document.documentElement.scrollHeight - window.innerHeight) * START_PROGRESS;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, target);
        return;
      }
      const controls = animate(0, target, {
        duration: GLIDE_SECONDS,
        ease: "easeInOut",
        onUpdate: (y) => window.scrollTo(0, y),
      });
      stop = () => controls.stop();
    }, START_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stop?.();
      inputs.forEach((type) => window.removeEventListener(type, cancel));
    };
  }, []);

  return null;
}
