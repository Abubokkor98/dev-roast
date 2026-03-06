import { GitHubRepo, GitHubReadme, GitHubRelease } from "@/types/github";
import { RepoAnalysis, RepoClassification } from "@/types/analysis";

const DAYS_MS = 24 * 60 * 60 * 1000;
const ABANDONMENT_DAYS_THRESHOLD = 365;
const ABANDONMENT_STARS_THRESHOLD = 3;
const ABANDONMENT_SIZE_THRESHOLD = 500;
const COMPLETED_README_MIN_LENGTH = 300;
const GOOD_README_MIN_LENGTH = 800;

const SEMVER_REGEX = /^v?\d+\.\d+\.\d+/;

interface RepoEnrichment {
  readme: GitHubReadme | null;
  releases: GitHubRelease[];
}

function classifyRepo(score: number): RepoClassification {
  if (score >= 85) return "Mature Project";
  if (score >= 70) return "Production Ready";
  if (score >= 50) return "Solid Project";
  if (score >= 25) return "Side Project";
  return "Experimental";
}

function getReadmeQuality(
  readme: GitHubReadme | null,
): RepoAnalysis["readmeQuality"] {
  if (!readme) return "none";

  const decodedLength = Buffer.from(readme.content, "base64").length;

  if (decodedLength > 2000) return "excellent";
  if (decodedLength > GOOD_README_MIN_LENGTH) return "good";
  if (decodedLength > COMPLETED_README_MIN_LENGTH) return "basic";
  return "none";
}

function detectBadges(decoded: string): boolean {
  return (
    decoded.includes("img.shields.io") ||
    decoded.includes("badge") ||
    decoded.includes("[![")
  );
}

function detectDemoLink(decoded: string): boolean {
  const lower = decoded.toLowerCase();
  return (
    lower.includes("demo") ||
    lower.includes("live") ||
    lower.includes("deployed") ||
    (lower.includes("https://") &&
      (lower.includes("vercel.app") ||
        lower.includes("netlify.app") ||
        lower.includes("github.io")))
  );
}

function detectSemanticVersioning(releases: GitHubRelease[]): boolean {
  return releases.some((release) => SEMVER_REGEX.test(release.tag_name));
}

export function analyzeRepo(
  repo: GitHubRepo,
  enrichment: RepoEnrichment,
): RepoAnalysis {
  let score = 0;

  // Engagement (max 35)
  score += Math.min(repo.stargazers_count, 25);
  score += Math.min(repo.forks_count, 10);

  // Maintenance (max 25)
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(repo.updated_at).getTime()) / DAYS_MS,
  );
  if (daysSinceUpdate < 180) score += 15;
  if (repo.open_issues_count < 10) score += 10;

  // Stability (max 15)
  const hasReleases = enrichment.releases.length > 0;
  const hasSemanticVersion = detectSemanticVersioning(enrichment.releases);
  if (hasReleases) score += 10;
  if (hasSemanticVersion) score += 5;

  // Documentation (max 25, only for enriched repos)
  const readmeQuality = getReadmeQuality(enrichment.readme);
  let hasBadges = false;
  let hasDemoLink = false;

  if (enrichment.readme) {
    const decoded = Buffer.from(enrichment.readme.content, "base64").toString(
      "utf-8",
    );
    const decodedLength = Buffer.byteLength(decoded, "utf-8");
    if (decodedLength > GOOD_README_MIN_LENGTH) score += 15;
    hasBadges = detectBadges(decoded);
    hasDemoLink = detectDemoLink(decoded);
    if (hasBadges) score += 5;
    if (hasDemoLink) score += 5;
  }

  // Intentional archive bonus
  if (repo.archived) score += 5;

  // Cap at 100
  score = Math.min(score, 100);

  // Abandonment detection (updated logic)
  const isOld = daysSinceUpdate > ABANDONMENT_DAYS_THRESHOLD;
  const isLowStars = repo.stargazers_count < ABANDONMENT_STARS_THRESHOLD;
  const isSmall = repo.size < ABANDONMENT_SIZE_THRESHOLD;
  const hasNoReleases = enrichment.releases.length === 0;
  const hasNoGoodReadme = readmeQuality === "none";

  // completed = old but has quality README + releases (intentionally finished)
  const isCompleted = isOld && !hasNoReleases && readmeQuality !== "none";

  // abandoned = old + low quality + low engagement + no releases
  const isAbandoned =
    isOld &&
    isLowStars &&
    isSmall &&
    hasNoReleases &&
    hasNoGoodReadme &&
    !repo.archived;

  return {
    name: repo.name,
    score,
    classification: classifyRepo(score),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    isAbandoned,
    isCompleted,
    hasReleases,
    readmeQuality,
    lastUpdatedDaysAgo: daysSinceUpdate,
  };
}
