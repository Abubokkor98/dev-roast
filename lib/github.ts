import {
  GitHubUser,
  GitHubRepo,
  GitHubReadme,
  GitHubRelease,
} from "@/types/github";
import { AnalysisError, githubStatusToError } from "@/lib/errors";

const GITHUB_API_BASE = "https://api.github.com";

// Builds request headers with optional GitHub token for higher rate limits
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

type FetchResult<T> = { data: T; error?: never } | { data?: never; error: AnalysisError };

// Generic GitHub API fetcher with 10s timeout, rate-limit detection, and error mapping.
// Returns a result object instead of throwing so errors survive the "use cache" boundary.
async function fetchGitHub<T>(path: string): Promise<FetchResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: getHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { error: githubStatusToError(response.status) };
    }

    const data = (await response.json()) as T;
    return { data };
  } catch (fetchError) {
    if (fetchError instanceof Error && fetchError.name === "AbortError") {
      return { error: { code: "UNKNOWN", message: "Request timed out" } };
    }
    return { error: { code: "UNKNOWN", message: "Network error" } };
  } finally {
    clearTimeout(timeout);
  }
}

// Fetches a GitHub user's profile data
export async function fetchUser(username: string): Promise<FetchResult<GitHubUser>> {
  return fetchGitHub<GitHubUser>(`/users/${username}`);
}

// Fetches all public repos for a user, paginating up to 300 max
export async function fetchRepos(username: string): Promise<FetchResult<GitHubRepo[]>> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  // Paginate to get all repos (up to 300 max to be safe)
  while (page <= 3) {
    const result = await fetchGitHub<GitHubRepo[]>(
      `/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
    );

    if (result.error) return result;

    repos.push(...result.data);

    if (result.data.length < perPage) {
      break;
    }

    page++;
  }

  return { data: repos };
}

// Fetches a repo's README content (base64-encoded), returns null if missing
export async function fetchReadme(
  owner: string,
  repo: string,
): Promise<GitHubReadme | null> {
  const result = await fetchGitHub<GitHubReadme>(`/repos/${owner}/${repo}/readme`);
  return result.data ?? null;
}

// Fetches up to 10 recent releases for a repo, returns empty array on failure
export async function fetchReleases(
  owner: string,
  repo: string,
): Promise<GitHubRelease[]> {
  const result = await fetchGitHub<GitHubRelease[]>(
    `/repos/${owner}/${repo}/releases?per_page=10`,
  );
  return result.data ?? [];
}
