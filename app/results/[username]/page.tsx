"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { AnalysisResult } from "@/types/analysis";
import { ShareCard } from "@/components/ShareCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type AnalysisState =
  | { status: "loading" }
  | { status: "success"; data: AnalysisResult }
  | { status: "error"; message: string };

const HEADER_HEIGHT = "56px";

export default function ResultsPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>({ status: "loading" });

  const username = params.username;

  useEffect(() => {
    async function analyze() {
      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/analyze?username=${encodeURIComponent(username)}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          setState({
            status: "error",
            message: errorData.error || "Something went wrong",
          });
          return;
        }

        const data: AnalysisResult = await response.json();
        setState({ status: "success", data });
      } catch {
        setState({
          status: "error",
          message:
            "Failed to connect. Please check your internet and try again.",
        });
      }
    }

    analyze();
  }, [username]);

  return (
    <div className="h-screen overflow-hidden bg-linear-to-b from-black via-zinc-950 to-black">
      {/* Header */}
      <header
        className="border-b border-white/5 bg-black/50 backdrop-blur-sm"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 font-bold text-white transition-colors hover:text-orange-400"
          >
            🔥 Dev Roast
          </button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="h-8 border-white/10 text-xs text-zinc-400 hover:border-orange-500/30 hover:text-orange-400"
          >
            Roast Another
          </Button>
        </div>
      </header>

      {/* Content — fills remaining viewport */}
      <main
        className="mx-auto flex max-w-2xl flex-col justify-center px-4"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        {/* Loading */}
        {state.status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🔥
            </motion.span>
            <p className="font-medium text-orange-400">
              Roasting @{username}...
            </p>
            <Skeleton className="h-40 w-full max-w-md rounded-xl" />
          </motion.div>
        )}

        {/* Error */}
        {state.status === "error" && (
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-5xl">💀</span>
            <h2 className="text-xl font-bold text-white">Oops!</h2>
            <p className="max-w-md text-sm text-zinc-400">{state.message}</p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Results — single viewport, no scroll */}
        {state.status === "success" && (
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Row 1: Avatar + Name + Score */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={state.data.avatarUrl}
                  alt={`${state.data.username}'s avatar`}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-orange-500/30"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {state.data.displayName}
                  </h1>
                  <p className="text-xs text-zinc-500">
                    @{state.data.username}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-orange-400">
                  {state.data.roast.roastScore}
                </span>
                <span className="text-lg text-zinc-500">/10</span>
              </div>
            </div>

            {/* Row 2: Archetype */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {state.data.roast.archetype.emoji}
              </span>
              <div>
                <h2 className="text-base font-bold text-orange-400">
                  {state.data.roast.archetype.name}
                </h2>
                <p className="text-xs text-zinc-500">
                  {state.data.roast.archetype.description}
                </p>
              </div>
            </div>

            {/* Row 3: Roast Text */}
            <div className="w-full rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <h3 className="mb-2 font-bold text-white">
                {state.data.roast.roastTitle}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-300">
                {state.data.roast.roastText}
              </p>
            </div>

            {/* Row 4: Compact Stats */}
            <div className="flex gap-6 text-center text-xs">
              <div>
                <div className="font-bold text-white">
                  {state.data.metrics.totalRepos}
                </div>
                <div className="text-zinc-500">Repos</div>
              </div>
              <div>
                <div className="font-bold text-white">
                  ⭐ {state.data.metrics.totalStars}
                </div>
                <div className="text-zinc-500">Stars</div>
              </div>
              <div>
                <div className="font-bold text-white">
                  {state.data.metrics.languageDiversity.dominantLanguage}
                </div>
                <div className="text-zinc-500">Top Lang</div>
              </div>
              <div>
                <div className="font-bold text-orange-400">
                  {Math.round(state.data.metrics.matureRatio * 100)}%
                </div>
                <div className="text-zinc-500">Mature</div>
              </div>
            </div>

            {/* Row 5: Share button */}
            <ShareCard data={state.data} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
