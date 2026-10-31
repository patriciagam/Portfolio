import type { Metadata } from "next";
import PageShell from "@/components/PageShell/PageShell";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Education · Patrícia Gameiro" };

// Edit the content here.

const DEGREES = [
  { degree: "M.Sc. Software Systems Engineering", school: "RWTH Aachen University", current: true },
  {
    degree: "B.Sc. Computer Science and Engineering",
    school: "Instituto Superior Técnico, University of Lisbon",
    current: false,
  },
];

// Grouped by organisation, like LinkedIn: one entry per org, its roles listed under it.
const ACTIVITIES = [
  {
    organisation: "NEIIST",
    about: "Computer Science student group, Técnico",
    roles: [
      {
        title: "Marketing & Design Team Member",
        dates: "Oct 2024 – Sep 2026",
        skills: ["Adobe Photoshop", "Adobe Illustrator"],
      },
      {
        title: "External Relations Team Member",
        dates: "Oct 2024 – Apr 2026",
        skills: ["Communication", "Corporate Events"],
      },
    ],
  },
  {
    organisation: "NAPE",
    about: "Student Support Office, Técnico",
    roles: [{ title: "Student Mentor", dates: "2023/24", skills: ["Communication", "Mentoring"] }],
  },
];

export default function EducationPage() {
  return (
    <PageShell fill>
      <div className={styles.page}>
        <section aria-labelledby="degrees-heading">
          <h1 id="degrees-heading" className={styles.sectionHeading}>
            <span className={styles.sectionTitle}>Education</span>
          </h1>
          <ol className={styles.timeline}>
            {DEGREES.map(({ degree, school, current }) => (
              <li key={degree} className={styles.item}>
                <h3 className={styles.title}>
                  {degree}
                  {current && <span className={styles.badge}>Current</span>}
                </h3>
                <p className={styles.meta}>{school}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="activities-heading">
          <h2 id="activities-heading" className={styles.sectionHeading}>
            <span className={styles.sectionTitle}>Extracurriculars</span>
          </h2>
          <div className={styles.groups}>
            {ACTIVITIES.map(({ organisation, about, roles }) => (
              <article key={organisation}>
                <h3 className={styles.org}>{organisation}</h3>
                <p className={styles.meta}>{about}</p>
                <ol className={`${styles.timeline} ${styles.roles}`}>
                  {roles.map(({ title, dates, skills }) => (
                    <li key={title} className={styles.item}>
                      <h4 className={styles.title}>{title}</h4>
                      <p className={styles.meta}>{dates}</p>
                      <p className={styles.skills}>{skills.join(" · ")}</p>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
