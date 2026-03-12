"use cache";

import { cacheLife, cacheTag } from "next/cache";
import {
  fetchUser,
  fetchRepos,
  fetchReadme,
  fetchReleases,
} from "@/lib/github";
import { analyzeRepo } from "@/lib/repoAnalyzer";
import { analyzeDeveloper } from "@/lib/developerAnalyzer";
import { calculateFinalScore } from "@/lib/scoringEngine";
import { detectArchetype } from "@/lib/personalityEngine";
import { AnalysisError } from "@/lib/errors";
import { getRepoRelevanceScore } from "@/lib/repoRelevance";
import {
  DeveloperMetrics,
  DeveloperArchetype,
  RepoAnalysis,
} from "@/types/analysis";

// Max number of repos to fetch detailed data (readme, releases) for
const TOP_REPOS_TO_ANALYZE = 10;
// Minimum stars required before fetching release data for a repo
const RELEASE_STAR_THRESHOLD = 3;

// Shape of the cached analysis result returned to the client
export interface CachedAnalysisData {
  username: string;
  avatarUrl: string;
  displayName: string;
  bio: string | null;
  metrics: DeveloperMetrics;
  topRepos: RepoAnalysis[];
  internalScore: number;
  archetype: DeveloperArchetype;
  analyzedAt: string;
}

export type CachedAnalysisResult =
  | { data: CachedAnalysisData; error?: never }
  | { data?: never; error: AnalysisError };

// Orchestrates the full analysis pipeline with Next.js caching (1-day TTL).
// Returns a result object instead of throwing so errors survive the "use cache"
// serialization boundary without losing type information.
export async function getCachedAnalysis(
  rawUsername: string,
): Promise<CachedAnalysisResult> {
  const username = rawUsername.toLowerCase();
  cacheTag(`analysis:${username}`);
  cacheLife({ stale: 86400, revalidate: 86400 });

  const [userResult, reposResult] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
  ]);

  if (userResult.error) return { error: userResult.error };
  if (reposResult.error) return { error: reposResult.error };

  const user = userResult.data;
  const repos = reposResult.data;

  // Filter out forks - only analyze the developer's own work
  const ownRepos = repos.filter((repo) => !repo.fork);

  if (ownRepos.length === 0) {
    return {
      error: {
        code: "NO_REPOS",
        message: `@${username} exists but has no public repositories to roast yet!`,
      },
    };
  }

  // Sort repos by relevance (stars, forks, recency) and pick the top N for deep analysis
  const sortedRepos = [...ownRepos].sort(
    (a, b) => getRepoRelevanceScore(b) - getRepoRelevanceScore(a),
  );
  const topRepos = sortedRepos.slice(0, TOP_REPOS_TO_ANALYZE);

  // Fetch readme and releases in parallel for each top repo
  const enrichments = await Promise.all(
    topRepos.map(async (repo) => {
      const [readme, releases] = await Promise.all([
        fetchReadme(username, repo.name),
        repo.stargazers_count > RELEASE_STAR_THRESHOLD
          ? fetchReleases(username, repo.name)
          : Promise.resolve([]),
      ]);
      return { readme, releases };
    }),
  );

  const topRepoAnalyses: RepoAnalysis[] = topRepos.map((repo, index) =>
    analyzeRepo(repo, enrichments[index]),
  );

  // Analyze remaining repos with basic data only (no readme/releases fetched)
  const remainingRepos = sortedRepos.slice(TOP_REPOS_TO_ANALYZE);
  const remainingAnalyses: RepoAnalysis[] = remainingRepos.map((repo) =>
    analyzeRepo(repo, { readme: null, releases: [] }),
  );

  const allAnalyses = [...topRepoAnalyses, ...remainingAnalyses];

  // Compute aggregate developer metrics, score, and personality archetype
  const metrics = analyzeDeveloper(user, allAnalyses);
  const internalScore = calculateFinalScore(metrics);
  const archetype = detectArchetype(metrics);

  return {
    data: {
      username: user.login,
      avatarUrl: user.avatar_url,
      displayName: user.name || user.login,
      bio: user.bio,
      metrics,
      topRepos: topRepoAnalyses,
      internalScore,
      archetype,
      analyzedAt: new Date().toISOString(),
    },
  };
}
