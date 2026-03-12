"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Flame, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GITHUB_URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/?$/;

function extractUsername(input: string): string {
  const match = input.match(GITHUB_URL_PATTERN);
  return match ? match[1] : input;
}

export function RoastForm() {
  const [username, setUsername] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Show username while navigating, clear when returned to home
  const displayValue = hasSubmitted && !isPending ? "" : username;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    const resolvedUsername = extractUsername(trimmed);

    setHasSubmitted(true);
    startTransition(() => {
      router.push(`/results/${encodeURIComponent(resolvedUsername)}`);
    });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Input
        id="github-username-input"
        type="text"
        aria-label="GitHub username"
        placeholder="GitHub username or URL"
        value={displayValue}
        onChange={(event) => {
          setHasSubmitted(false);
          setUsername(event.target.value);
        }}
        className="h-12 border-zinc-200 bg-zinc-50 text-center text-sm text-zinc-900 placeholder:text-sm placeholder:text-zinc-400 focus-visible:ring-orange-500 sm:text-left sm:text-base sm:placeholder:text-base dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
      />
      <Button
        id="roast-me-button"
        type="submit"
        disabled={!displayValue.trim() || isPending}
        className="h-12 w-full gap-2 bg-linear-to-r from-orange-500 to-red-500 px-6 font-bold text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-40 sm:w-auto"
      >
        {isPending ? (
          <>
            Roasting...
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            Roast Me
            <Flame className="h-4 w-4" />
          </>
        )}
      </Button>
    </motion.form>
  );
}
