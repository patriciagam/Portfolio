import type { CSSProperties } from "react";
import { SKILL_ICONS } from "./skillIcons";
import styles from "./SkillsMarquee.module.css";

type Skill = { name: string; icon: keyof typeof SKILL_ICONS };

const SKILLS: Skill[] = [
  { name: "Java", icon: "java" },
  { name: "C", icon: "c" },
  { name: "C++", icon: "cpp" },
  { name: "Python", icon: "python" },
  { name: "TypeScript", icon: "typescript" },
  { name: "PostgreSQL", icon: "postgresql" },
  { name: "HTML", icon: "html" },
  { name: "CSS", icon: "css" },
  { name: "NextJS", icon: "nextjs" },
  { name: "Git", icon: "git" },
  { name: "Docker", icon: "docker" },
  { name: "Cypress", icon: "cypress" },
  { name: "Figma", icon: "figma" },
  { name: "AWS", icon: "aws" },
];

// Seconds per loop for the full list; shorter rows scale it down so every
// row moves at the same speed.
const SECONDS_PER_LIST = 40;

/** One endless strip. The list is rendered twice so the loop wraps seamlessly. */
function Track({ skills, reverse = false }: { skills: Skill[]; reverse?: boolean }) {
  const duration = (SECONDS_PER_LIST * skills.length) / SKILLS.length;
  return (
    <ul
      className={`${styles.track} ${reverse ? styles.reverse : ""}`}
      style={{ "--duration": `${duration}s` } as CSSProperties}
    >
      {[0, 1].map((copy) =>
        skills.map(({ name, icon }) => {
          const Icon = SKILL_ICONS[icon];
          return (
            <li
              key={`${copy}-${name}`}
              className={`${styles.skill} ${copy === 1 ? styles.clone : ""}`}
              aria-hidden={copy === 1 || undefined}
            >
              <Icon />
              {name}
            </li>
          );
        }),
      )}
    </ul>
  );
}

const half = Math.ceil(SKILLS.length / 2);

/** "Technical Skills" heading with the endless, hover-to-pause skills strip.
    Desktop: one row. Phones: the skills split over two rows moving in
    opposite directions. CSS shows one layout or the other. */
export default function SkillsMarquee() {
  return (
    <section className={styles.section} aria-labelledby="skills-heading">
      <div className={styles.text}>
        <h2 id="skills-heading" className={styles.heading}>
          Technical Skills
        </h2>
        <p className={styles.subheading}>Technologies I work with daily</p>
      </div>
      <div className={styles.marquee}>
        <div className={styles.oneRow}>
          <Track skills={SKILLS} />
        </div>
        <div className={styles.twoRows}>
          <Track skills={SKILLS.slice(0, half)} />
          <Track skills={SKILLS.slice(half)} reverse />
        </div>
      </div>
    </section>
  );
}
