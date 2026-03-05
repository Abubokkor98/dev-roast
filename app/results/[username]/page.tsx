"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Flame, Skull, Star } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { ArchetypeIcon } from "@/components/archetype-icon";
import { ExportBar } from "@/components/export-bar";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type AnalysisState =
  | { status: "loading" }
  | { status: "success"; data: AnalysisResult }
  | { status: "error"; message: string };

const NAVBAR_HEIGHT = "57px";

export default function ResultsPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>({ status: "loading" });
  const resultsRef = useRef<HTMLDivElement>(null);

  const username = params.username;

  useEffect(() => {
    const controller = new AbortController();

    async function analyze() {
      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/analyze?username=${encodeURIComponent(username)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          let message = "Something went wrong";
          try {
            const errorData = (await response.json()) as { error?: string };
            message = errorData.error || message;
          } catch {
            // ignore non-JSON payloads
          }
          setState({
            status: "error",
            message,
          });
          return;
        }

        const data: AnalysisResult = await response.json();
        setState({ status: "success", data });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setState({
          status: "error",
          message:
            "Failed to connect. Please check your internet and try again.",
        });
      }
    }

    analyze();

    return () => controller.abort();
  }, [username]);

  return (
    <>
      <Header />
      <main
        className="mx-auto flex max-w-2xl flex-col justify-center overflow-hidden px-4"
        style={{ height: `calc(100vh - ${NAVBAR_HEIGHT})` }}
      >
        {/* Loading */}
        {state.status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Flame className="h-10 w-10 text-orange-500" />
            </motion.div>
            <p className="font-medium text-orange-500">
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
            <Skull className="h-12 w-12 text-zinc-400" />
            <h2 className="text-xl font-bold">Oops!</h2>
            <p className="max-w-md text-sm text-zinc-500">{state.message}</p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-red-300 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Go Home
            </Button>
          </motion.div>
        )}

        {/* Results */}
        {state.status === "success" && (
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Capturable content - this is what gets exported as PNG */}
            <div
              ref={resultsRef}
              className="flex w-full flex-col items-center gap-5 rounded-xl bg-background p-6"
            >
              {/* Row 1: Avatar + Name + Score */}
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={state.data.avatarUrl}
                    alt={`${state.data.username}'s avatar`}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-orange-500/30"
                  />
                  <div>
                    <h1 className="text-lg font-bold">
                      {state.data.displayName}
                    </h1>
                    <p className="text-xs text-zinc-500">
                      @{state.data.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-orange-500">
                    {state.data.roast.roastScore}
                  </span>
                  <span className="text-lg text-zinc-400">/10</span>
                </div>
              </div>

              {/* Row 2: Archetype */}
              <div className="flex items-center gap-3">
                <ArchetypeIcon
                  archetype={state.data.roast.archetype.name}
                  className="h-8 w-8 text-orange-500"
                />
                <div>
                  <h2 className="text-base font-bold text-orange-500">
                    {state.data.roast.archetype.name}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {state.data.roast.archetype.description}
                  </p>
                </div>
              </div>

              {/* Row 3: Roast Text */}
              <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-center dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 font-bold">
                  {state.data.roast.roastTitle}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {state.data.roast.roastText}
                </p>
              </div>

              {/* Row 4: Compact Stats */}
              <div className="flex gap-6 text-center text-xs">
                <div>
                  <div className="font-bold">
                    {state.data.metrics.totalRepos}
                  </div>
                  <div className="text-zinc-500">Repos</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 font-bold">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {state.data.metrics.totalStars}
                  </div>
                  <div className="text-zinc-500">Stars</div>
                </div>
                <div>
                  <div className="font-bold">
                    {state.data.metrics.languageDiversity.dominantLanguage}
                  </div>
                  <div className="text-zinc-500">Top Lang</div>
                </div>
                <div>
                  <div className="font-bold text-orange-500">
                    {Math.round(state.data.metrics.matureRatio * 100)}%
                  </div>
                  <div className="text-zinc-500">Mature</div>
                </div>
              </div>
            </div>

            {/* Export bar - outside the capturable area */}
            <ExportBar
              contentRef={resultsRef}
              username={state.data.username}
              roastScore={state.data.roast.roastScore}
              archetypeName={state.data.roast.archetype.name}
            />
          </motion.div>
        )}
      </main>
    </>
  );
}
