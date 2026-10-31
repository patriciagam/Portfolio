import { cacheLife } from "next/cache";
import { PROFILES } from "@/lib/profiles";

export type Project = {
  title: string;
  tags: string[];
  summary: string;
  year: string;
  href: string;
};

// Shown until a GitHub username is set, or if GitHub can't be reached.
const PLACEHOLDER: Project = {
  title: "Project title",
  tags: ["Method", "Tool", "Domain"],
  summary: "Add a short summary of the project: the problem, your role, and what changed because of it.",
  year: "Year",
  href: "/projects",
};
const PLACEHOLDER_COUNT = 8;
const MAX_PROJECTS = 12;

type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  created_at: string;
  fork: boolean;
  archived: boolean;
};

/** Projects for the carousel: public GitHub repos if configured, else placeholders. */
export async function getProjects(): Promise<Project[]> {
  const repos = PROFILES.githubUsername ? await getGitHubProjects(PROFILES.githubUsername) : null;
  return repos?.length ? repos : Array.from({ length: PLACEHOLDER_COUNT }, () => PLACEHOLDER);
}

/** Public, non-fork repos, most recently pushed first. Refreshed hourly. */
async function getGitHubProjects(username: string): Promise<Project[] | null> {
  "use cache";
  cacheLife("hours");

  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  // Optional: raises GitHub's limit from 60 to 5000 requests an hour.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`,
      { headers },
    );
    if (!res.ok) return null;
    const repos: GitHubRepo[] = await res.json();

    return repos
      .filter((repo) => !repo.fork && !repo.archived && repo.name !== username)
      .slice(0, MAX_PROJECTS)
      .map((repo) => ({
        title: repo.name,
        tags: [repo.language, ...(repo.topics ?? [])].filter((tag): tag is string => !!tag).slice(0, 3),
        summary: repo.description ?? "",
        year: String(new Date(repo.created_at).getFullYear()),
        href: repo.homepage || repo.html_url,
      }));
  } catch {
    return null;
  }
}
