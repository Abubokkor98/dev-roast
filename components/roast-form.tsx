"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Flame, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RoastForm() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setIsLoading(true);
    router.push(`/results/${encodeURIComponent(trimmed)}`);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Input
        id="github-username-input"
        type="text"
        aria-label="GitHub username"
        placeholder="Enter your GitHub username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        className="h-12 border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
      />
      <Button
        id="roast-me-button"
        type="submit"
        disabled={!username.trim() || isLoading}
        className="h-12 gap-2 bg-linear-to-r from-orange-500 to-red-500 px-6 font-bold text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-40"
      >
        {isLoading ? (
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
