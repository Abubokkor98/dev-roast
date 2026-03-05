import {
  GitHubUser,
  GitHubRepo,
  GitHubReadme,
  GitHubRelease,
  CommitWeek,
} from "@/types/github";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: getHeaders(),
  });

  if (response.status === 404) {
    throw new GitHubError("User not found", 404);
  }

  if (response.status === 403) {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (remaining === "0") {
      throw new GitHubError(
        "GitHub API rate limit exceeded. Try again later.",
        429,
      );
    }
    throw new GitHubError("Access forbidden", 403);
  }

  if (!response.ok) {
    throw new GitHubError(
      `GitHub API error: ${response.statusText}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export async function fetchUser(username: string): Promise<GitHubUser> {
  return fetchGitHub<GitHubUser>(`/users/${username}`);
}

export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  // Paginate to get all repos (up to 300 max to be safe)
  while (page <= 3) {
    const batch = await fetchGitHub<GitHubRepo[]>(
      `/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
    );

    repos.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page++;
  }

  return repos;
}

export async function fetchReadme(
  owner: string,
  repo: string,
): Promise<GitHubReadme | null> {
  try {
    return await fetchGitHub<GitHubReadme>(`/repos/${owner}/${repo}/readme`);
  } catch {
    return null;
  }
}

export async function fetchReleases(
  owner: string,
  repo: string,
): Promise<GitHubRelease[]> {
  try {
    return await fetchGitHub<GitHubRelease[]>(
      `/repos/${owner}/${repo}/releases?per_page=10`,
    );
  } catch {
    return [];
  }
}

export async function fetchCommitActivity(
  owner: string,
  repo: string,
): Promise<CommitWeek[] | null> {
  try {
    const result = await fetchGitHub<CommitWeek[]>(
      `/repos/${owner}/${repo}/stats/commit_activity`,
    );
    return Array.isArray(result) ? result : null;
  } catch {
    return null;
  }
}
