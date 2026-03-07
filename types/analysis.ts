export type RepoClassification =
  | "Experimental"
  | "Side Project"
  | "Solid Project"
  | "Production Ready"
  | "Mature Project";

export interface RepoAnalysis {
  name: string;
  score: number;
  classification: RepoClassification;
  stars: number;
  forks: number;
  language: string | null;
  isAbandoned: boolean;
  isCompleted: boolean;
  isEnriched: boolean;
  hasReleases: boolean;
  readmeQuality: "none" | "basic" | "good" | "excellent";
  lastUpdatedDaysAgo: number;
}

export interface LanguageDiversity {
  uniqueLanguages: number;
  languageDistribution: Record<string, number>;
  dominantLanguage: string;
  dominantLanguageRatio: number;
  diversityScore: number;
}

export interface DeveloperMetrics {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  matureRatio: number;
  abandonmentRatio: number;
  completedRatio: number;
  activityConsistency: number;
  documentationScore: number;
  engagementScore: number;
  languageDiversity: LanguageDiversity;
  accountAgeDays: number;
}

export type ArchetypeName =
  | "The Experimenter"
  | "Indie Hacker"
  | "Tutorial Collector"
  | "Open Source Monk"
  | "Overengineer Supreme"
  | "The Polyglot"
  | "One-Trick Pony";

export interface DeveloperArchetype {
  name: ArchetypeName;
  icon: string;
  description: string;
  confidence: number;
}

export interface RoastResult {
  roastTitle: string;
  roastText: string;
  roastScore: number;
  archetype: DeveloperArchetype;
  highlights: string[];
  improvementTips: string[];
}

export interface AnalysisResult {
  username: string;
  avatarUrl: string;
  displayName: string;
  bio: string | null;
  metrics: DeveloperMetrics;
  topRepos: RepoAnalysis[];
  roast: RoastResult;
  analyzedAt: string;
}
