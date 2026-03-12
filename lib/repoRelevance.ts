import { GitHubRepo } from "@/types/github";

const DAYS_MS = 24 * 60 * 60 * 1000;
// Recency bonus tiers: full bonus if pushed within 90 days, partial within 180
const RECENCY_FULL_DAYS = 90;
const RECENCY_PARTIAL_DAYS = 180;
const RECENCY_FULL_BONUS = 20;
const RECENCY_PARTIAL_BONUS = 10;
// Repos larger than 500 KB get a small relevance bonus
const SIZE_BONUS_THRESHOLD = 500;
const SIZE_BONUS = 5;
// Weighted multipliers: forks weigh more than stars for relevance ranking
const STAR_WEIGHT = 3;
const FORK_WEIGHT = 5;

/** Scores a repo by relevance for selection priority (stars, forks, recency, size). */
export function getRepoRelevanceScore(repo: GitHubRepo): number {
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
