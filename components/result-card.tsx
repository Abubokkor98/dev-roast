import { motion } from "motion/react";
import { Flame, Star } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { ArchetypeIcon } from "@/components/archetype-icon";
import { ExportBar } from "@/components/export-bar";

interface ResultCardProps {
  data: AnalysisResult;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function ResultCard({ data, contentRef }: ResultCardProps) {
  const maturePercent = Math.round(data.metrics.matureRatio * 100);

  return (
    <motion.div
      className="flex flex-col items-center gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Capturable content - this is what gets exported as PNG */}
      <div
        ref={contentRef}
        className="flex w-full flex-col items-center gap-5 overflow-hidden rounded-xl border border-orange-500/20 bg-white p-6 dark:bg-zinc-950"
      >
        {/* Row 1: Avatar + Name + Score */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.avatarUrl}
              alt={`${data.username}'s avatar`}
              width={48}
              height={48}
              className="rounded-full border-2 border-orange-500/30"
            />
            <div>
              <h1 className="text-lg font-bold">{data.displayName}</h1>
              <p className="text-xs text-zinc-500">@{data.username}</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-orange-500">
              {data.roast.roastScore}
            </span>
            <span className="text-lg text-zinc-400">/10</span>
          </div>
        </div>

        {/* Row 2: Archetype */}
        <div className="flex items-center gap-3">
          <ArchetypeIcon
            archetype={data.roast.archetype.name}
            className="h-8 w-8 text-orange-500"
          />
          <div>
            <h2 className="text-base font-bold text-orange-500">
              {data.roast.archetype.name}
            </h2>
            <p className="text-xs text-zinc-500">
              {data.roast.archetype.description}
            </p>
          </div>
        </div>

        {/* Row 3: Roast Text */}
        <div className="w-full rounded-xl border border-orange-500/10 bg-zinc-100 p-5 text-center dark:bg-white/5">
          <Flame className="mx-auto mb-2 h-5 w-5 text-orange-500" />
          <h3 className="mb-2 font-bold text-orange-500">
            {data.roast.roastTitle}
          </h3>
          <p className="text-sm italic leading-relaxed text-zinc-600 dark:text-zinc-400">
            &ldquo;{data.roast.roastText}&rdquo;
          </p>
        </div>

        {/* Row 4: Compact Stats */}
        <div className="flex gap-6 text-center text-xs">
          <div>
            <div className="font-bold">{data.metrics.totalRepos}</div>
            <div className="text-zinc-500">Repos</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 font-bold">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              {data.metrics.totalStars}
            </div>
            <div className="text-zinc-500">Stars</div>
          </div>
          <div>
            <div className="font-bold">
              {data.metrics.languageDiversity.dominantLanguage}
            </div>
            <div className="text-zinc-500">Top Lang</div>
          </div>
          <div>
            <div className="font-bold text-orange-500">{maturePercent}%</div>
            <div className="text-zinc-500">Mature</div>
          </div>
        </div>
      </div>

      {/* Export bar - outside the capturable area */}
      <ExportBar
        contentRef={contentRef}
        username={data.username}
        roastScore={data.roast.roastScore}
        archetypeName={data.roast.archetype.name}
      />
    </motion.div>
  );
}
