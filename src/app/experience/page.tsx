import GradientHeading from "@/components/GradientHeading/GradientHeading";
import PageShell from "@/components/PageShell/PageShell";
import AutoScroll from "./AutoScroll";
import ScrollReveal from "./ScrollReveal";
import TimelineLine from "./TimelineLine";
import styles from "./page.module.css";

// Scroll progress at which each row appears: starting just before the
// timeline ball reaches the row's top, done when it reaches the row's middle.
// Rows sit at 25-46% and 63-75% of the line's length.
const ROW_1: [number, number] = [0.15, 0.355];
const ROW_2: [number, number] = [0.53, 0.69];

export default function ExperiencePage() {
  return (
    // The tall track gives the page scroll distance; the content stays pinned
    // while scrolling drives the timeline and nav underline fill.
    <div className={styles.scrollTrack}>
      <AutoScroll />
      <div className={styles.pinned}>
        <PageShell fit>
          <GradientHeading>Experience</GradientHeading>
          <section className={styles.timeline}>
            <div className={styles.positions}>
              <ScrollReveal className={styles.position} range={ROW_1}>
                <div className={styles.positionLeft}>
                  <h2 className={styles.jobTitle}>
                    Systems Analysis and
                    <br />
                    Modeling Teaching Assistant
                  </h2>
                  <p className={`${styles.company} ${styles.companyFirst}`}>
                    Instituto Superior Técnico, University of Lisbon
                  </p>
                </div>
                <p className={styles.date}>October 2025 - January 2026</p>
              </ScrollReveal>
              <ScrollReveal
                className={`${styles.position} ${styles.positionSecond}`}
                range={ROW_2}
              >
                <div className={`${styles.positionLeft} ${styles.positionLeftSecond}`}>
                  <h2 className={styles.jobTitle}>Administrative Officer</h2>
                  <p className={styles.company}>Irmãos Gameiro, Construção Civil Lda</p>
                </div>
                <p className={`${styles.date} ${styles.dateSecond}`}>
                  September 2016 - June 2022
                </p>
              </ScrollReveal>
            </div>

            <TimelineLine />

            <div className={styles.descriptions}>
              <ScrollReveal className={styles.descriptionFirst} range={ROW_1}>
                <p>
                  Taught UML, ArchiMate, and requirements engineering to 40+ students and
                  graded their projects, earning a 9/9 satisfaction rating.
                </p>
              </ScrollReveal>
              <ScrollReveal className={styles.descriptionSecond} range={ROW_2}>
                <p>
                  Maintained project documentation for regulatory compliance and data accuracy,
                  and supported planning by joining stakeholder meetings with architects and
                  municipal authorities and doing market research.
                </p>
              </ScrollReveal>
            </div>
          </section>
        </PageShell>
      </div>
    </div>
  );
}
