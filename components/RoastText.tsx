"use client";

import { RoastResult } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";

interface RoastTextProps {
  roast: RoastResult;
}

export function RoastText({ roast }: RoastTextProps) {
  return (
    <div className="space-y-6">
      {/* Roast Header */}
      <Card className="border-orange-500/20 bg-linear-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm">
        <CardContent className="space-y-4 p-6">
          {/* Score + Archetype */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{roast.archetype.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-orange-400">
                  {roast.archetype.name}
                </h3>
                <p className="text-sm text-zinc-400">
                  {roast.archetype.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3">
              <span className="text-3xl font-black text-orange-400">
                {roast.roastScore}
              </span>
              <span className="text-xs text-zinc-400">/ 10</span>
            </div>
          </div>

          {/* Roast Text */}
          <div className="rounded-xl bg-black/30 p-5">
            <h4 className="mb-2 text-lg font-bold text-white">
              {roast.roastTitle}
            </h4>
            <p className="leading-relaxed text-zinc-300">{roast.roastText}</p>
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      {roast.highlights.length > 0 && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-3 text-sm font-semibold text-zinc-400">
              🏆 Highlights
            </h3>
            <ul className="space-y-2">
              {roast.highlights.map((highlight) => (
                <li key={highlight} className="text-sm text-zinc-300">
                  {highlight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvement Tips */}
      {roast.improvementTips.length > 0 && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-3 text-sm font-semibold text-zinc-400">
              💡 Improvement Tips
            </h3>
            <ul className="space-y-2">
              {roast.improvementTips.map((tip) => (
                <li key={tip} className="text-sm text-zinc-300">
                  • {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
