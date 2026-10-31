import type { Metadata } from "next";
import GradientHeading from "@/components/GradientHeading/GradientHeading";
import PageShell from "@/components/PageShell/PageShell";
import ProjectCarousel from "@/components/ProjectCarousel/ProjectCarousel";
import { getProjects } from "@/lib/projects";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Projects · Patrícia Gameiro" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PageShell background="radial" fill>
      <div className={styles.layout}>
        <GradientHeading>Checkout my Work</GradientHeading>
        <div className={styles.carousel}>
          <ProjectCarousel projects={projects} />
        </div>
      </div>
    </PageShell>
  );
}
