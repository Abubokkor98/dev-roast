import { GitHubRepo, GitHubReadme, GitHubRelease } from "@/types/github";
import { RepoAnalysis, RepoClassification } from "@/types/analysis";

const DAYS_MS = 24 * 60 * 60 * 1000;
// Thresholds for detecting abandoned repos (old, low stars, small size)
const ABANDONMENT_DAYS_THRESHOLD = 365;
const ABANDONMENT_STARS_THRESHOLD = 3;
const ABANDONMENT_SIZE_THRESHOLD = 500;
// Byte-length thresholds for grading README quality tiers
const COMPLETED_README_MIN_LENGTH = 300;
const GOOD_README_MIN_LENGTH = 800;
// Repos pushed within this many days get an "active development" bonus
const RECENTLY_PUSHED_DAYS = 90;

// Matches semantic version tags like "v1.2.3" in release names
const SEMVER_REGEX = /^v?\d+\.\d+\.\d+/;

// Optional extra data fetched for top repos (readme content and release history)
interface RepoEnrichment {
  readme: GitHubReadme | null;
  releases: GitHubRelease[];
}

// Maps a numeric repo score (0-100) to a human-readable classification label
function classifyRepo(score: number): RepoClassification {
  if (score >= 85) return "Mature Project";
  if (score >= 70) return "Production Ready";
  if (score >= 50) return "Solid Project";
  if (score >= 25) return "Side Project";
  return "Experimental";
}

// Grades a README as none/basic/good/excellent based on its decoded byte length
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

// Checks if a README contains CI/status badges (shields.io, badge, etc.)
function detectBadges(decoded: string): boolean {
  return (
    decoded.includes("img.shields.io") ||
    decoded.includes("badge") ||
    decoded.includes("[![")
  );
}

// Checks if a README contains a live demo or deployment link
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

// Returns true if any release uses semantic versioning (e.g. v1.0.0)
function detectSemanticVersioning(releases: GitHubRelease[]): boolean {
  return releases.some((release) => SEMVER_REGEX.test(release.tag_name));
}

// Scores a single repo (0-100) across engagement, maintenance, stability, and docs
export function analyzeRepo(
  repo: GitHubRepo,
  enrichment: RepoEnrichment,
): RepoAnalysis {
  let score = 0;

  // Engagement (max 35) - logarithmic star scaling
  const starScore =
    repo.stargazers_count > 0
      ? Math.min(Math.round(Math.log2(repo.stargazers_count + 1) * 3), 35)
      : 0;
  score += starScore;
  score += Math.min(repo.forks_count, 10);

  // Maintenance (max 25)
  const daysSincePush = Math.floor(
    (Date.now() - new Date(repo.pushed_at).getTime()) / DAYS_MS,
  );
  if (daysSincePush < 180) score += 15;
  if (repo.open_issues_count < 10) score += 10;

  // Active development bonus (max 10)
  if (daysSincePush < RECENTLY_PUSHED_DAYS) score += 10;

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
  const isOld = daysSincePush > ABANDONMENT_DAYS_THRESHOLD;
  const isLowStars = repo.stargazers_count < ABANDONMENT_STARS_THRESHOLD;
  const isSmall = repo.size < ABANDONMENT_SIZE_THRESHOLD;
  const hasNoReleases = enrichment.releases.length === 0;
  const hasNoGoodReadme = readmeQuality === "none";

  // completed = has quality indicators (good README, releases, or recently pushed with content)
  const isCompleted =
    (isOld && !hasNoReleases && readmeQuality !== "none") ||
    (!isOld &&
      readmeQuality !== "none" &&
      repo.size > ABANDONMENT_SIZE_THRESHOLD);

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
    isEnriched: enrichment.readme !== null,
    hasReleases,
    readmeQuality,
    lastUpdatedDaysAgo: daysSincePush,
  };
}
