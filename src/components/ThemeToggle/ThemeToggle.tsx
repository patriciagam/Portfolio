"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import styles from "./ThemeToggle.module.css";

// Must match the key read by the inline script in app/layout.tsx.
// Only set once the visitor uses the toggle; until then the system setting wins.
export const THEME_STORAGE_KEY = "pg-theme";

type Mode = "light" | "dark";

function readMode(): Mode {
  return document.documentElement.dataset.mode === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-mode"] });
  return () => observer.disconnect();
}

export default function ThemeToggle() {
  const mode = useSyncExternalStore<Mode>(subscribe, readMode, () => "dark");

  const toggle = () => {
    const next: Mode = mode === "light" ? "dark" : "light";
    if (next === "light") document.documentElement.dataset.mode = "light";
    else delete document.documentElement.dataset.mode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {/* Both icons render; CSS picks one from data-mode so the server
          render is right before hydration. */}
      <SunIcon className={styles.sun} />
      <MoonIcon className={styles.moon} />
    </button>
  );
}
