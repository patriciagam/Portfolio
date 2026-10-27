import SocialLinks from "@/components/SocialLinks/SocialLinks";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <SocialLinks direction="row" />
      <p className={styles.copyright}>© 2026 Patrícia Gameiro</p>
    </footer>
  );
}
