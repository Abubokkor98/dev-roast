import {
  GitHubUser,
  GitHubRepo,
  GitHubReadme,
  GitHubRelease,
} from "@/types/github";
import { GitHubError } from "@/lib/errors";

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: getHeaders(),
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeout);
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
