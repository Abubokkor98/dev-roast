"use client";

import { useEffect, useRef, useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { ResultSkeleton } from "@/components/result-skeleton";
import { ResultError } from "@/components/result-error";
import { ResultCard } from "@/components/result-card";
import type { AnalysisError } from "@/lib/errors";

type AnalysisState =
  | { status: "loading" }
  | { status: "success"; data: AnalysisResult }
  | { status: "error"; message: string; errorCode?: AnalysisError["code"] };

interface ResultsContentProps {
  username: string;
}

export function ResultsContent({ username }: ResultsContentProps) {
  const [state, setState] = useState<AnalysisState>({ status: "loading" });
  const resultsRef = useRef<HTMLDivElement>(null);

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
          let errorCode: AnalysisError["code"] | undefined;
          try {
            const errorData = (await response.json()) as { code?: AnalysisError["code"]; error?: string };
            message = errorData.error || message;
            errorCode = errorData.code;
          } catch {
            // ignore non-JSON payloads
          }
          setState({ status: "error", message, errorCode });
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
    <main className="mx-auto flex min-h-[calc(100dvh-57px)] max-w-2xl flex-col items-center justify-center px-4 py-6">
      {state.status === "loading" && <ResultSkeleton username={username} />}

      {state.status === "error" && (
        <ResultError message={state.message} errorCode={state.errorCode} />
      )}

      {state.status === "success" && (
        <ResultCard data={state.data} contentRef={resultsRef} />
      )}
    </main>
  );
}
