import Image from "next/image";
import CatWidget from "@/components/CatWidget/CatWidget";
import PageShell from "@/components/PageShell/PageShell";
import SkillsMarquee from "@/components/SkillsMarquee/SkillsMarquee";
import LandingSocialLinks from "./LandingSocialLinks";
import styles from "./page.module.css";

export default function Home() {
  return (
    <PageShell variant="landing">
      <section className={styles.hero}>
        <h1 className={styles.name}>
          I’m <span className={styles.lavender}>Patrícia Gameiro</span>.
          <br />
          I turn <span className={styles.complexity}>complexity</span> into{" "}
          <span className={styles.clarity}>clarity</span>
        </h1>
        <p className={styles.role}>
          Software Systems Engineering Master&apos;s student at RWTH Aachen, interested in
          systems analysis, requirements engineering and modelling complex software systems.
        </p>
        {/* TODO: add the CV file to public/cv.pdf */}
        <a className={styles.downloadCv} href="/cv.pdf" download>
          Download CV
          <Image src="/figma/icon-download.svg" alt="" width={19} height={22} />
        </a>
      </section>
      <LandingSocialLinks />
      <div className={styles.skills}>
        <SkillsMarquee />
      </div>
      <CatWidget />
    </PageShell>
  );
}
