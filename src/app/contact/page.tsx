import type { Metadata } from "next";
import GradientHeading from "@/components/GradientHeading/GradientHeading";
import PageShell from "@/components/PageShell/PageShell";
import { PROFILES } from "@/lib/profiles";
import ContactForm from "./ContactForm";
import CopyButton from "./CopyButton";
import LocalTime from "./LocalTime";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Contact · Patrícia Gameiro" };

// Left: text from index-patricia.html. Right: email written out and a form.
export default function ContactPage() {
  return (
    <PageShell fill>
      <GradientHeading>Let’s talk</GradientHeading>
      <div className={styles.contact}>
        <div>
          <p className={styles.lead}>
            Open to internships, research projects and conversations about requirements,
            modelling and making complex systems easier to reason about.
          </p>
          <p className={styles.location}>
            <span className={styles.dot} aria-hidden="true" />
            <span>
              Based in <strong>Munich, Germany</strong>
            </span>
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
            <span>
              <LocalTime /> local time
            </span>
          </p>
        </div>
        <div>
          <div className={styles.emailRow}>
            <a className={styles.email} href={`mailto:${PROFILES.email}`} id="contact-email">
              {PROFILES.email}
            </a>
            <CopyButton value={PROFILES.email} targetId="contact-email" />
          </div>
          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
