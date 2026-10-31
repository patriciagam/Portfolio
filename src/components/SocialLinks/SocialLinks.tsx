import Link from "next/link";
import { EmailIcon, GitHubIcon, LinkedInIcon } from "@/components/icons";
import { PROFILES } from "@/lib/profiles";
import styles from "./SocialLinks.module.css";

type SocialLinksProps = {
  direction?: "column" | "row";
  className?: string;
};

/** LinkedIn, GitHub and Email buttons with the hover pill from index-patricia.html. */
export default function SocialLinks({ direction = "column", className }: SocialLinksProps) {
  return (
    <ul className={`${styles.social} ${styles[direction]} ${className ?? ""}`}>
      <li>
        <a href={PROFILES.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
          <LinkedInIcon className={styles.icon} />
        </a>
      </li>
      <li>
        <a href={PROFILES.github} target="_blank" rel="noopener" aria-label="GitHub">
          <GitHubIcon className={styles.icon} />
        </a>
      </li>
      <li>
        <a href="mailto:patricia.a.gameiro@gmail.com" aria-label="Email">
          <EmailIcon className={styles.icon} />
        </a>
      </li>
    </ul>
  );
}
