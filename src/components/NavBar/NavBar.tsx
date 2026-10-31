"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { MenuIcon } from "@/components/icons";
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
  // Small screens only: the links fold into a menu opened by the button.
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`${styles.navBar} ${translucent ? styles.translucent : ""}`}
      data-menu-open={menuOpen || undefined}
    >
      {showsProgress && (
        <motion.div
          className={styles.progress}
          style={{ scaleX: scrollYProgress }}
          aria-hidden
        />
      )}
      <nav className={styles.inner} aria-label="Main">
        {/* On small screens this clips the drop-down at the bar's bottom edge
            so it slides out from under the bar; on desktop it's layout-neutral. */}
        <div className={styles.menu}>
          <ul id="main-menu" className={styles.list}>
            {NAV_ITEMS.map(({ label, href }) => {
              const isActive = href === pathname;
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className={styles.link}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <ThemeToggle />
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon className={styles.menuIcon} open={menuOpen} />
        </button>
      </nav>
      {/* Tapping outside the open menu closes it. Always rendered (on small
          screens) so it can fade out as well as in. */}
      <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden />
    </header>
  );
}
