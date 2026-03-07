import {
  RepoAnalysis,
  DeveloperMetrics,
  LanguageDiversity,
} from "@/types/analysis";
import { GitHubUser } from "@/types/github";

const DAYS_MS = 24 * 60 * 60 * 1000;
const LANGUAGE_DIVERSITY_DIVISOR = 5;

function computeLanguageDiversity(repos: RepoAnalysis[]): LanguageDiversity {
  const languageCounts: Record<string, number> = {};

  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  }

  const uniqueLanguages = Object.keys(languageCounts).length;
  const totalWithLanguage = Object.values(languageCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  let dominantLanguage = "None";
  let dominantCount = 0;

  for (const [language, count] of Object.entries(languageCounts)) {
    if (count > dominantCount) {
      dominantLanguage = language;
      dominantCount = count;
    }
  }

  const dominantLanguageRatio =
    totalWithLanguage > 0 ? dominantCount / totalWithLanguage : 0;
  const diversityScore = Math.min(
    uniqueLanguages / LANGUAGE_DIVERSITY_DIVISOR,
    1.0,
  );

  return {
    uniqueLanguages,
    languageDistribution: languageCounts,
    dominantLanguage,
    dominantLanguageRatio,
    diversityScore,
  };
}

function computeActivityConsistency(repos: RepoAnalysis[]): number {
  if (repos.length === 0) return 0;

  const updateDaysAgo = repos
    .map((r) => r.lastUpdatedDaysAgo)
    .sort((a, b) => a - b);

  // What fraction of repos have been updated in the last 6 months
  const recentlyUpdated = updateDaysAgo.filter((d) => d < 180).length;
  const recentRatio = recentlyUpdated / repos.length;

  // Calculate standard deviation of update days (lower = more consistent)
  const mean = updateDaysAgo.reduce((s, d) => s + d, 0) / updateDaysAgo.length;
  const variance =
    updateDaysAgo.reduce((s, d) => s + Math.pow(d - mean, 2), 0) /
    updateDaysAgo.length;
  const stdDev = Math.sqrt(variance);

  // Normalize: low stddev + high recent ratio = high consistency
  const stdDevScore = Math.max(0, 1 - stdDev / 365);
  const consistencyScore = (recentRatio * 0.6 + stdDevScore * 0.4) * 100;

  return Math.min(Math.round(consistencyScore), 100);
}

function computeDocumentationScore(repos: RepoAnalysis[]): number {
  if (repos.length === 0) return 0;

  const qualityScores: Record<RepoAnalysis["readmeQuality"], number> = {
    none: 0,
    basic: 30,
    good: 70,
    excellent: 100,
  };

  const totalScore = repos.reduce(
    (sum, repo) => sum + qualityScores[repo.readmeQuality],
    0,
  );

  return Math.round(totalScore / repos.length);
}

const MATURE_THRESHOLD = 40;

export function analyzeDeveloper(
  user: GitHubUser,
  repoAnalyses: RepoAnalysis[],
): DeveloperMetrics {
  const totalRepos = repoAnalyses.length;
  const totalStars = repoAnalyses.reduce((s, r) => s + r.stars, 0);
  const totalForks = repoAnalyses.reduce((s, r) => s + r.forks, 0);

  const matureRepos = repoAnalyses.filter(
    (r) => r.score >= MATURE_THRESHOLD,
  ).length;
  const matureRatio = totalRepos > 0 ? matureRepos / totalRepos : 0;

  const abandonedRepos = repoAnalyses.filter((r) => r.isAbandoned).length;
  const abandonmentRatio = totalRepos > 0 ? abandonedRepos / totalRepos : 0;

  const completedRepos = repoAnalyses.filter((r) => r.isCompleted).length;
  const completedRatio = totalRepos > 0 ? completedRepos / totalRepos : 0;

  const activityConsistency = computeActivityConsistency(repoAnalyses);
  const documentationScore = computeDocumentationScore(repoAnalyses);
  const engagementScore = totalRepos > 0 ? totalStars / totalRepos : 0;
  const languageDiversity = computeLanguageDiversity(repoAnalyses);

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / DAYS_MS,
  );

  return {
    totalRepos,
    totalStars,
    totalForks,
    matureRatio,
    abandonmentRatio,
    completedRatio,
    activityConsistency,
    documentationScore,
    engagementScore,
    languageDiversity,
    accountAgeDays,
  };
}
