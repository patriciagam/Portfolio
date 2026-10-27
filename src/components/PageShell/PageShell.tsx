import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./PageShell.module.css";

type PageShellProps = {
  children: ReactNode;
  /** The landing frame places its glow ellipses differently from the other frames. */
  variant?: "landing" | "section";
  background?: "solid" | "radial";
  /** Fill exactly the viewport above the footer (no vertical scroll). */
  fit?: boolean;
  /** Fill at least the viewport above the footer, growing (and scrolling)
      only if the content is taller. Children lay out as a flex column. */
  fill?: boolean;
};

export default function PageShell({
  children,
  variant = "section",
  background = "solid",
  fit = false,
  fill = false,
}: PageShellProps) {
  const shellClass = [
    styles.shell,
    background === "radial" && styles.radial,
    fit && styles.fit,
    fill && styles.fill,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClass}>
      <div className={`${styles.frame} ${styles[variant]}`}>
        {/* Dark mode: the Figma ellipse exports. Light mode: CSS glows tinted
            from the theme tokens (the exports have dark colours baked in). */}
        <Image
          className={`${styles.ellipseTop} ${styles.darkOnly}`}
          src="/figma/ellipse-1.svg"
          alt=""
          width={756}
          height={745}
          priority
        />
        <Image
          className={`${styles.ellipseBottom} ${styles.darkOnly}`}
          src="/figma/ellipse-2.svg"
          alt=""
          width={580}
          height={580}
          loading="eager"
        />
        <div className={`${styles.glowTop} ${styles.lightOnly}`} />
        <div className={`${styles.glowBottom} ${styles.lightOnly}`} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
