import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_STAT_COUNT = 4;

interface ResultSkeletonProps {
  username: string;
}

export function ResultSkeleton({ username }: ResultSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full flex-col items-center gap-6"
    >
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Flame className="h-10 w-10 text-orange-500" />
      </motion.div>
      <p className="font-medium text-orange-500">Roasting @{username}...</p>

      <div className="flex w-full flex-col gap-5 rounded-xl border border-orange-500/20 bg-white p-6 dark:bg-zinc-950">
        {/* Row 1: Avatar + Name + Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-16" />
        </div>

        {/* Row 2: Archetype */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        {/* Row 3: Roast Text */}
        <div className="space-y-3 rounded-xl border border-orange-500/10 bg-zinc-100 p-5 dark:bg-white/5">
          <Skeleton className="mx-auto h-5 w-48" />
          <Skeleton className="mx-auto h-3 w-full" />
          <Skeleton className="mx-auto h-3 w-4/5" />
        </div>

        {/* Row 4: Stats */}
        <div className="flex justify-center gap-6">
          {Array.from({ length: SKELETON_STAT_COUNT }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
