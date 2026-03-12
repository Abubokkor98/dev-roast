"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Skull, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisError } from "@/lib/errors";

interface ResultErrorProps {
  message: string;
  errorCode?: AnalysisError["code"];
}

export function ResultError({ message, errorCode }: ResultErrorProps) {
  const router = useRouter();
  const isNotFound = errorCode === "USER_NOT_FOUND";

  const icon = isNotFound ? (
    <SearchX className="h-12 w-12 text-zinc-400" />
  ) : (
    <Skull className="h-12 w-12 text-zinc-400" />
  );

  const heading = isNotFound ? "User Not Found" : "Oops!";

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="flex flex-col items-center gap-4 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {icon}
      <h2 className="text-xl font-bold">{heading}</h2>
      <p className="max-w-md text-sm text-zinc-500">{message}</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {isNotFound && (
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-linear-to-r from-orange-500 to-red-500 font-bold text-white hover:from-orange-600 hover:to-red-600 sm:w-auto"
          >
            Try a different username
          </Button>
        )}
        {!isNotFound && (
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full border-red-300 text-red-500 hover:bg-red-50 sm:w-auto dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Go Home
          </Button>
        )}
      </div>
    </motion.div>
  );
}
