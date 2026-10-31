"use client";

import { useRef, useState } from "react";
import styles from "./page.module.css";

/** Copies `value` to the clipboard; falls back to selecting `targetId`'s text. */
export default function CopyButton({ value, targetId }: { value: string; targetId: string }) {
  const [label, setLabel] = useState("Copy");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = (text: string) => {
    setLabel(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLabel("Copy"), 1600);
  };

  const selectText = () => {
    const node = document.getElementById(targetId);
    const selection = window.getSelection();
    if (!node || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    flash("Selected");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      flash("Copied");
    } catch {
      selectText();
    }
  };

  return (
    <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
      {label}
    </button>
  );
}
