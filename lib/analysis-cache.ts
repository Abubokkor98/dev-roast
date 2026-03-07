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
import { NoReposError } from "@/lib/errors";
import { getRepoRelevanceScore } from "@/lib/repoRelevance";
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
    throw new NoReposError();
  }

  const sortedRepos = [...ownRepos].sort(
    (a, b) => getRepoRelevanceScore(b) - getRepoRelevanceScore(a),
  );
  const topRepos = sortedRepos.slice(0, TOP_REPOS_TO_ANALYZE);

  const enrichments = await Promise.all(
    topRepos.map(async (repo) => {
      try {
        const [readme, releases] = await Promise.all([
          fetchReadme(username, repo.name),
          repo.stargazers_count > RELEASE_STAR_THRESHOLD
            ? fetchReleases(username, repo.name)
            : Promise.resolve([]),
        ]);
        return { readme, releases };
      } catch {
        return { readme: null, releases: [] };
      }
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
