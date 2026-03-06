import { DeveloperMetrics } from "@/types/analysis";

const WEIGHT_MATURITY = 0.25;
const WEIGHT_CONSISTENCY = 0.2;
const WEIGHT_ENGAGEMENT = 0.15;
const WEIGHT_DOCUMENTATION = 0.15;
const WEIGHT_STABILITY = 0.15;
const WEIGHT_CODING_INTENSITY = 0.1;

const MAX_ENGAGEMENT_SCORE = 50;
const MAX_COMMITS_PER_WEEK = 30;
const PUBLIC_SCORE_DIVISOR = 10;

function normalizeEngagement(engagementScore: number): number {
  return Math.min(engagementScore / MAX_ENGAGEMENT_SCORE, 1.0) * 100;
}

function computeStabilityScore(metrics: DeveloperMetrics): number {
  // Based on mature ratio and completion ratio
  const matureComponent = metrics.matureRatio * 60;
  const completionComponent = metrics.completedRatio * 40;
  return Math.min(matureComponent + completionComponent, 100);
}

function normalizeCodingIntensity(commitsPerWeek: number): number {
  return Math.min(commitsPerWeek / MAX_COMMITS_PER_WEEK, 1.0) * 100;
}

export function calculateFinalScore(metrics: DeveloperMetrics): number {
  const maturityScore = metrics.matureRatio * 100;
  const consistencyScore = metrics.activityConsistency;
  const engagementNormalized = normalizeEngagement(metrics.engagementScore);
  const documentationScore = metrics.documentationScore;
  const stabilityScore = computeStabilityScore(metrics);
  const codingIntensity = normalizeCodingIntensity(
    metrics.averageCommitsPerWeek,
  );

  const weightedScore =
    maturityScore * WEIGHT_MATURITY +
    consistencyScore * WEIGHT_CONSISTENCY +
    engagementNormalized * WEIGHT_ENGAGEMENT +
    documentationScore * WEIGHT_DOCUMENTATION +
    stabilityScore * WEIGHT_STABILITY +
    codingIntensity * WEIGHT_CODING_INTENSITY;

  // Abandonment penalty
  const abandonmentPenalty = metrics.abandonmentRatio * 15;

  const finalScore = Math.max(
    0,
    Math.min(100, weightedScore - abandonmentPenalty),
  );

  return Math.round(finalScore);
}

export function toPublicScore(internalScore: number): number {
  const publicScore = Math.max(
    1,
    Math.ceil(internalScore / PUBLIC_SCORE_DIVISOR),
  );
  return Math.min(publicScore, 10);
}
