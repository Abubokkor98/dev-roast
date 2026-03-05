import {
  DeveloperMetrics,
  DeveloperArchetype,
  ArchetypeName,
} from "@/types/analysis";

const HIGH_REPO_COUNT = 30;
const MEDIUM_REPO_COUNT = 10;
const LOW_MATURITY_RATIO = 0.2;
const GOOD_ENGAGEMENT = 5;
const HIGH_STARS = 50;
const HIGH_CONSISTENCY = 60;
const POLYGLOT_THRESHOLD = 6;
const ONE_TRICK_RATIO = 0.85;
const HIGH_ABANDONMENT = 0.5;
const LARGE_AVG_SIZE_INDICATOR = 15;

interface ArchetypeDefinition {
  name: ArchetypeName;
  icon: string;
  description: string;
  score: (metrics: DeveloperMetrics) => number;
}

const archetypeDefinitions: ArchetypeDefinition[] = [
  {
    name: "The Experimenter",
    icon: "flask-conical",
    description:
      "Launches repos like fireworks - bright, fast, and all over the sky.",
    score: (m) => {
      let s = 0;
      if (m.totalRepos > HIGH_REPO_COUNT) s += 40;
      else if (m.totalRepos > MEDIUM_REPO_COUNT) s += 20;
      if (m.matureRatio < LOW_MATURITY_RATIO) s += 30;
      if (m.abandonmentRatio > HIGH_ABANDONMENT) s += 20;
      if (m.languageDiversity.uniqueLanguages > 3) s += 10;
      return s;
    },
  },
  {
    name: "Indie Hacker",
    icon: "rocket",
    description:
      "Ships products, slaps on a demo link, and moves to the next big idea.",
    score: (m) => {
      let s = 0;
      if (m.totalRepos >= MEDIUM_REPO_COUNT && m.totalRepos <= HIGH_REPO_COUNT)
        s += 25;
      if (m.engagementScore > GOOD_ENGAGEMENT) s += 25;
      if (m.matureRatio > 0.3) s += 20;
      if (m.documentationScore > 50) s += 15;
      if (m.activityConsistency > 40) s += 15;
      return s;
    },
  },
  {
    name: "Tutorial Collector",
    icon: "book-open",
    description:
      "Has a repo for every tutorial ever watched. Completion rate: optional.",
    score: (m) => {
      let s = 0;
      if (m.totalRepos > HIGH_REPO_COUNT) s += 30;
      if (m.engagementScore < 2) s += 25;
      if (m.documentationScore < 30) s += 25;
      if (m.matureRatio < 0.1) s += 20;
      return s;
    },
  },
  {
    name: "Open Source Monk",
    icon: "heart-handshake",
    description:
      "Fewer repos, but each one is a temple of clean code and consistent commits.",
    score: (m) => {
      let s = 0;
      if (m.totalRepos < MEDIUM_REPO_COUNT) s += 15;
      if (m.totalStars > HIGH_STARS) s += 25;
      if (m.activityConsistency > HIGH_CONSISTENCY) s += 25;
      if (m.matureRatio > 0.5) s += 20;
      if (m.documentationScore > 60) s += 15;
      return s;
    },
  },
  {
    name: "Overengineer Supreme",
    icon: "settings",
    description:
      "Builds a rocket ship to go to the grocery store. Impressive, but why?",
    score: (m) => {
      let s = 0;
      if (m.engagementScore < 3 && m.totalRepos < LARGE_AVG_SIZE_INDICATOR)
        s += 30;
      if (m.matureRatio > 0.3 && m.engagementScore < 2) s += 25;
      if (m.documentationScore > 60 && m.totalStars < 20) s += 20;
      if (m.activityConsistency < 30) s += 15;
      return s;
    },
  },
  {
    name: "The Polyglot",
    icon: "globe",
    description:
      "Speaks more programming languages than most people speak human ones.",
    score: (m) => {
      let s = 0;
      if (m.languageDiversity.uniqueLanguages >= POLYGLOT_THRESHOLD) s += 40;
      else if (m.languageDiversity.uniqueLanguages >= 4) s += 20;
      if (m.languageDiversity.dominantLanguageRatio < 0.4) s += 25;
      if (m.totalRepos > MEDIUM_REPO_COUNT) s += 15;
      if (m.languageDiversity.diversityScore > 0.8) s += 20;
      return s;
    },
  },
  {
    name: "One-Trick Pony",
    icon: "crosshair",
    description:
      "Has found the one true language and refuses to acknowledge others exist.",
    score: (m) => {
      let s = 0;
      if (m.languageDiversity.dominantLanguageRatio > ONE_TRICK_RATIO) s += 40;
      else if (m.languageDiversity.dominantLanguageRatio > 0.7) s += 20;
      if (m.languageDiversity.uniqueLanguages <= 2) s += 25;
      if (m.totalRepos > MEDIUM_REPO_COUNT) s += 15;
      if (m.matureRatio > 0.3) s += 10;
      return s;
    },
  },
];

export function detectArchetype(metrics: DeveloperMetrics): DeveloperArchetype {
  let bestArchetype = archetypeDefinitions[0];
  let bestScore = 0;

  for (const archetype of archetypeDefinitions) {
    const score = archetype.score(metrics);
    if (score > bestScore) {
      bestScore = score;
      bestArchetype = archetype;
    }
  }

  const maxPossible = 100;
  const confidence = Math.min(bestScore / maxPossible, 1.0);

  return {
    name: bestArchetype.name,
    icon: bestArchetype.icon,
    description: bestArchetype.description,
    confidence,
  };
}
