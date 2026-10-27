import styles from "./GradientHeading.module.css";

export default function GradientHeading({ children }: { children: string }) {
  return <h1 className={styles.heading}>{children}</h1>;
}
