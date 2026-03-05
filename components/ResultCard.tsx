"use client";

import { DeveloperMetrics } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResultCardProps {
  metrics: DeveloperMetrics;
  displayName: string;
  username: string;
}

interface StatItemProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

function StatItem({ label, value, accent = false }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/5 px-4 py-3">
      <span
        className={`text-2xl font-bold ${accent ? "text-orange-400" : "text-white"}`}
      >
        {value}
      </span>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

export function ResultCard({
  metrics,
  displayName,
  username,
}: ResultCardProps) {
  const topLanguages = Object.entries(
    metrics.languageDiversity.languageDistribution,
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="space-y-6 p-6">
        {/* Developer Info */}
        <div>
          <h2 className="text-xl font-bold text-white">{displayName}</h2>
          <p className="text-sm text-zinc-400">@{username}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatItem label="Repos" value={metrics.totalRepos} />
          <StatItem label="Stars" value={metrics.totalStars} />
          <StatItem label="Forks" value={metrics.totalForks} />
          <StatItem
            label="Mature"
            value={`${Math.round(metrics.matureRatio * 100)}%`}
            accent
          />
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatItem
            label="Consistency"
            value={`${metrics.activityConsistency}/100`}
          />
          <StatItem
            label="Documentation"
            value={`${metrics.documentationScore}/100`}
          />
          <StatItem
            label="Engagement"
            value={metrics.engagementScore.toFixed(1)}
          />
        </div>

        {/* Language Diversity */}
        {topLanguages.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">
              Languages ({metrics.languageDiversity.uniqueLanguages} total)
            </h3>
            <div className="flex flex-wrap gap-2">
              {topLanguages.map(([language, count]) => (
                <Badge
                  key={language}
                  variant="secondary"
                  className="bg-white/10 text-zinc-200 hover:bg-white/15"
                >
                  {language} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Account Age */}
        <div className="text-xs text-zinc-500">
          Account age: {Math.round(metrics.accountAgeDays / 365)} years • Avg{" "}
          {(metrics.averageCommitsPerWeek ?? 0).toFixed(1)} commits/week
        </div>
      </CardContent>
    </Card>
  );
}
