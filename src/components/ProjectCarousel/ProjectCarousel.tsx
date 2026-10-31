"use client";

import { animate } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ArrowUpRightIcon, ChevronIcon } from "@/components/icons";
import type { Project } from "@/lib/projects";
import styles from "./ProjectCarousel.module.css";

// A full-width row of cards that loops forever. It moves with trackpad
// swipes, mouse-wheel, click-and-drag, the arrow buttons or arrow keys.
//
// The loop: the cards are rendered three times and the view is kept in the
// middle copy. When scrolling drifts into an outer copy, the position jumps
// by exactly one copy's width, which looks identical, so it never ends.

const THEMES = ["c1", "c2", "c3", "c4"] as const;
const COPIES = 3;
// Each copy needs to be wider than any screen for the loop to work, so a
// short list is repeated up to this many cards.
const MIN_CARDS_PER_COPY = 8;
// Pixels the pointer must travel before a press counts as a drag, not a click.
const DRAG_THRESHOLD = 5;
// Slight alternating tilt, in degrees, so the row looks hand-placed.
const TILTS = [-2, 1.5, -1, 2, -1.5, 1];
// How long the arrows take to move one card.
const STEP_SECONDS = 0.45;

export default function ProjectCarousel({ projects }: { projects: Project[] }) {
  const cards = Array.from({ length: Math.max(projects.length, MIN_CARDS_PER_COPY) }, (_, i) => ({
    ...projects[i % projects.length],
    isRepeat: i >= projects.length,
  }));
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // The arrow buttons' glide in progress, and where it's heading.
  const glide = useRef<{ stop: () => void; target: number } | null>(null);
  const stopGlide = useCallback(() => {
    glide.current?.stop();
    glide.current = null;
  }, []);

  /** Width of one copy of the cards (including each card's trailing gap). */
  const copyWidth = useCallback(() => (trackRef.current?.scrollWidth ?? 0) / COPIES, []);

  /** Keeps the scroll position inside the middle copy. */
  const recentre = useCallback(() => {
    const el = scrollerRef.current;
    const width = copyWidth();
    // An arrow glide keeps itself inside the middle copy; don't interrupt it.
    if (!el || !width || glide.current) return;
    if (el.scrollLeft < width * 0.5) el.scrollLeft += width;
    else if (el.scrollLeft > width * 1.5) el.scrollLeft -= width;
  }, [copyWidth]);

  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    // Start at the first card of the middle copy.
    el.scrollLeft = copyWidth();
    // Card sizes change with the window height; keep the same card in view.
    let lastWidth = copyWidth();
    const resize = new ResizeObserver(() => {
      const width = copyWidth();
      if (lastWidth) el.scrollLeft *= width / lastWidth;
      lastWidth = width;
      recentre();
    });
    resize.observe(track);

    // A plain mouse wheel only scrolls vertically; turn it into sideways movement.
    const onWheel = (event: WheelEvent) => {
      stopGlide();
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };

    // Click-and-drag with the mouse (touch and pens already scroll natively).
    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;
    const onPointerDown = (event: PointerEvent) => {
      stopGlide();
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = el.scrollLeft;
      dragged = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!dragged && Math.abs(dx) > DRAG_THRESHOLD) {
        dragged = true;
        el.setPointerCapture(event.pointerId);
        el.dataset.dragging = "true";
      }
      if (!dragged) return;
      el.scrollLeft = startScroll - dx;
      // A loop jump moves scrollLeft; shift the drag origin with it.
      const before = el.scrollLeft;
      recentre();
      startScroll += el.scrollLeft - before;
    };
    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      delete el.dataset.dragging;
    };
    // Swallow the click that ends a drag so it doesn't open a project.
    const onClick = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    el.addEventListener("scroll", recentre, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClick, true);
    return () => {
      resize.disconnect();
      el.removeEventListener("scroll", recentre);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClick, true);
    };
  }, [copyWidth, recentre, stopGlide]);

  /** Moves by one card. Clicks during a glide add up (next, next, next...),
      and the glide is kept inside the middle copy so the loop never cuts it. */
  const step = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    const width = copyWidth();
    if (!el || !width) return;
    // One card plus its gap. (Measured from layout, since the tilted cards'
    // on-screen boxes are slightly wider than the space they take up.)
    const distance = width / cards.length;

    let from = el.scrollLeft;
    let target = (glide.current?.target ?? from) + direction * distance;
    // Crossing into an outer copy: shift both ends back by one copy, which
    // looks identical, so the whole glide stays in the middle copy.
    if (target > width * 1.5) {
      from -= width;
      target -= width;
    } else if (target < width * 0.5) {
      from += width;
      target += width;
    }
    glide.current?.stop();
    el.scrollLeft = from;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = target;
      glide.current = null;
      return;
    }
    const controls = animate(from, target, {
      duration: STEP_SECONDS,
      ease: "easeOut",
      onUpdate: (x) => {
        el.scrollLeft = x;
      },
      onComplete: () => {
        glide.current = null;
      },
    });
    glide.current = { stop: () => controls.stop(), target };
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };

  return (
    <div className={styles.carousel}>
      <div
        ref={scrollerRef}
        className={styles.scroller}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        onKeyDown={onKeyDown}
      >
        <div ref={trackRef} className={styles.track}>
          {Array.from({ length: COPIES }, (_, copy) =>
            cards.map(({ title, tags, summary, year, href, isRepeat }, index) => {
              // Only the middle copy's originals are "real"; the rest exist for the loop.
              const isClone = copy !== 1 || isRepeat;
              return (
                <article
                  key={`${copy}-${index}`}
                  className={`${styles.card} ${styles[THEMES[index % THEMES.length]]}`}
                  style={{ "--tilt": `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
                  aria-hidden={isClone || undefined}
                >
                  <div className={styles.body}>
                    <h2 className={styles.title}>{title}</h2>
                    {tags.length > 0 && (
                      <ul className={styles.tags}>
                        {tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    )}
                    <p className={styles.summary}>{summary}</p>
                    <div className={styles.foot}>
                      <span>{year}</span>
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener" : undefined}
                        aria-label={`Open ${title}`}
                        tabIndex={isClone ? -1 : undefined}
                        draggable={false}
                      >
                        <ArrowUpRightIcon />
                      </a>
                    </div>
                  </div>
                </article>
              );
            }),
          )}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} aria-label="Previous project" onClick={() => step(-1)}>
          <ChevronIcon direction="left" />
        </button>
        <button type="button" className={styles.arrow} aria-label="Next project" onClick={() => step(1)}>
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
