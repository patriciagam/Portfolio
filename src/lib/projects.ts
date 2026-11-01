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
// Language plus GitHub topics. Six fit on a card (in up to three rows) with
// room left for the summary.
const MAX_TAGS = 6;

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
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "User-Agent": "Portfolio" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`,
      { headers, cache: "force-cache", next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
    const repos: GitHubRepo[] = await res.json();

    return repos
      .filter((repo) => !repo.fork && !repo.archived && repo.name !== username)
      .slice(0, MAX_PROJECTS)
      .map((repo) => ({
        title: repo.name,
        tags: projectTags(repo),
        summary: repo.description ?? "",
        year: String(new Date(repo.created_at).getFullYear()),
        href: repo.homepage || repo.html_url,
      }));
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    if (process.env.NEXT_PHASE !== "phase-production-build") throw error;
    return null;
  }
}

/** The repo's language, then its topics, skipping a topic that just repeats
    the language (e.g. a "python" topic on a Python repo). */
function projectTags(repo: GitHubRepo): string[] {
  const language = repo.language?.toLowerCase();
  const topics = (repo.topics ?? []).filter((topic) => topic.toLowerCase() !== language);
  return [repo.language, ...topics].filter((tag): tag is string => !!tag).slice(0, MAX_TAGS);
}
