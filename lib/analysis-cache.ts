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
import {
  DeveloperMetrics,
  DeveloperArchetype,
  RepoAnalysis,
} from "@/types/analysis";

const TOP_REPOS_TO_ANALYZE = 10;
const RELEASE_STAR_THRESHOLD = 3;

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

export async function getCachedAnalysis(
  rawUsername: string,
): Promise<CachedAnalysisData> {
  const username = rawUsername.toLowerCase();
  cacheTag(`analysis:${username}`);
  cacheLife({ stale: 86400, revalidate: 86400 });

  const [user, repos] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
  ]);

  // Filter out forks - only analyze the developer's own work
  const ownRepos = repos.filter((repo) => !repo.fork);

  if (ownRepos.length === 0) {
    throw new Error("NO_REPOS");
  }

  const DAYS_MS = 24 * 60 * 60 * 1000;
  const RECENCY_FULL_DAYS = 90;
  const RECENCY_PARTIAL_DAYS = 180;
  const RECENCY_FULL_BONUS = 20;
  const RECENCY_PARTIAL_BONUS = 10;
  const SIZE_BONUS_THRESHOLD = 500;
  const SIZE_BONUS = 5;
  const STAR_WEIGHT = 3;
  const FORK_WEIGHT = 5;

  function getRepoRelevanceScore(repo: (typeof ownRepos)[number]): number {
    const daysSincePush = Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / DAYS_MS,
    );

    const recencyBonus =
      daysSincePush < RECENCY_FULL_DAYS
        ? RECENCY_FULL_BONUS
        : daysSincePush < RECENCY_PARTIAL_DAYS
          ? RECENCY_PARTIAL_BONUS
          : 0;

    const sizeBonus = repo.size > SIZE_BONUS_THRESHOLD ? SIZE_BONUS : 0;

    return (
      repo.stargazers_count * STAR_WEIGHT +
      repo.forks_count * FORK_WEIGHT +
      recencyBonus +
      sizeBonus
    );
  }

  const sortedRepos = [...ownRepos].sort(
    (a, b) => getRepoRelevanceScore(b) - getRepoRelevanceScore(a),
  );
  const topRepos = sortedRepos.slice(0, TOP_REPOS_TO_ANALYZE);

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

  const remainingRepos = sortedRepos.slice(TOP_REPOS_TO_ANALYZE);
  const remainingAnalyses: RepoAnalysis[] = remainingRepos.map((repo) =>
    analyzeRepo(repo, { readme: null, releases: [] }),
  );

  const allAnalyses = [...topRepoAnalyses, ...remainingAnalyses];

  const metrics = analyzeDeveloper(user, allAnalyses);
  const internalScore = calculateFinalScore(metrics);
  const archetype = detectArchetype(metrics);

  return {
    username: user.login,
    avatarUrl: user.avatar_url,
    displayName: user.name || user.login,
    bio: user.bio,
    metrics,
    topRepos: topRepoAnalyses,
    internalScore,
    archetype,
    analyzedAt: new Date().toISOString(),
  };
}
