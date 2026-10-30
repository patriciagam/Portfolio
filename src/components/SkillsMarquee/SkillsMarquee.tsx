import { SKILL_ICONS } from "./skillIcons";
import styles from "./SkillsMarquee.module.css";

const SKILLS = [
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

/** "Technical Skills" heading with the endless, hover-to-pause skills strip. */
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
        {/* The list is rendered twice so the loop can wrap seamlessly. */}
        <ul className={styles.track}>
          {[0, 1].map((copy) =>
            SKILLS.map(({ name, icon }) => {
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
      </div>
    </section>
  );
}
