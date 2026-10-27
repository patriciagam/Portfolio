"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll } from "motion/react";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./NavBar.module.css";

// Order from index-patricia.html.
const NAV_ITEMS = [
  { label: "About", href: "/" },
  { label: "Education", href: "/education" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const translucent = pathname === "/projects";
  // On Experience the bottom border fills with page scroll, in step with the
  // timeline line (both read the same document scroll progress).
  const showsProgress = pathname === "/experience";
  const { scrollYProgress } = useScroll();

  return (
    <header className={`${styles.navBar} ${translucent ? styles.translucent : ""}`}>
      {showsProgress && (
        <motion.div
          className={styles.progress}
          style={{ scaleX: scrollYProgress }}
          aria-hidden
        />
      )}
      <nav className={styles.inner} aria-label="Main">
        <ul className={styles.list}>
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = href === pathname;
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={styles.link}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
