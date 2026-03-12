import { DeveloperMetrics } from "@/types/analysis";

// Weights for each scoring dimension (must sum to 1.0)
const WEIGHT_MATURITY = 0.3;
const WEIGHT_CONSISTENCY = 0.2;
const WEIGHT_ENGAGEMENT = 0.2;
const WEIGHT_DOCUMENTATION = 0.15;
const WEIGHT_STABILITY = 0.15;

// Engagement scores above this are treated as a perfect 100%
const MAX_ENGAGEMENT_SCORE = 50;
// Divides internal 0-100 score to a user-facing 1-10 scale
const PUBLIC_SCORE_DIVISOR = 10;

// Normalizes raw engagement (stars/repo) to a 0-100 scale, capped at MAX_ENGAGEMENT_SCORE
function normalizeEngagement(engagementScore: number): number {
  return Math.min(engagementScore / MAX_ENGAGEMENT_SCORE, 1.0) * 100;
}

// Combines mature ratio (60%) and completion ratio (40%) into a stability score
function computeStabilityScore(metrics: DeveloperMetrics): number {
  // Based on mature ratio and completion ratio
  const matureComponent = metrics.matureRatio * 60;
  const completionComponent = metrics.completedRatio * 40;
  return Math.min(matureComponent + completionComponent, 100);
}

// Computes the final 0-100 internal score using weighted dimensions minus abandonment penalty
export function calculateFinalScore(metrics: DeveloperMetrics): number {
  const maturityScore = metrics.matureRatio * 100;
  const consistencyScore = metrics.activityConsistency;
  const engagementNormalized = normalizeEngagement(metrics.engagementScore);
  const documentationScore = metrics.documentationScore;
  const stabilityScore = computeStabilityScore(metrics);

  const weightedScore =
    maturityScore * WEIGHT_MATURITY +
    consistencyScore * WEIGHT_CONSISTENCY +
    engagementNormalized * WEIGHT_ENGAGEMENT +
    documentationScore * WEIGHT_DOCUMENTATION +
    stabilityScore * WEIGHT_STABILITY;

  // Abandonment penalty
  const abandonmentPenalty = metrics.abandonmentRatio * 15;

  const finalScore = Math.max(
    0,
    Math.min(100, weightedScore - abandonmentPenalty),
  );

  return Math.round(finalScore);
}

// Converts internal 0-100 score to a user-facing 1-10 scale
export function toPublicScore(internalScore: number): number {
  const publicScore = Math.max(
    1,
    Math.ceil(internalScore / PUBLIC_SCORE_DIVISOR),
  );
  return Math.min(publicScore, 10);
}
