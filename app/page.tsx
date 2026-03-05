"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Flame, BarChart3, Dna, Target, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

interface Feature {
  icon: React.ReactNode;
  label: string;
}

const FEATURES: Feature[] = [
  {
    icon: <BarChart3 className="h-4 w-4 text-orange-500" />,
    label: "Repo Analysis",
  },
  { icon: <Dna className="h-4 w-4 text-purple-500" />, label: "Personality" },
  { icon: <Target className="h-4 w-4 text-red-500" />, label: "Roast Score" },
  { icon: <Share2 className="h-4 w-4 text-blue-500" />, label: "Share Card" },
];

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    router.push(`/results/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Theme toggle - top right */}
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      {/* Main content */}
      <motion.div
        className="relative z-10 flex max-w-xl flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Flame className="h-16 w-16 text-orange-500" strokeWidth={2.5} />
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="bg-linear-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
            Dev Roast
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
            Get your GitHub profile brutally{" "}
            <span className="text-orange-500">analyzed</span> and{" "}
            <span className="text-red-500">roasted</span>
          </p>
        </div>

        {/* Description */}
        <p className="max-w-md text-sm leading-relaxed text-zinc-500">
          We analyze your repos, commits, documentation, and coding patterns to
          assign you a developer archetype and a roast score. It&apos;s
          educational, shareable, and only slightly painful.
        </p>

        {/* Input Form */}
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
            placeholder="Enter GitHub username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-12 border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
          />
          <Button
            id="roast-me-button"
            type="submit"
            disabled={!username.trim()}
            className="h-12 gap-2 bg-linear-to-r from-orange-500 to-red-500 px-6 font-bold text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-40"
          >
            Roast Me
            <Flame className="h-4 w-4" />
          </Button>
        </motion.form>

        {/* Features */}
        <motion.div
          className="mt-4 grid grid-cols-2 gap-4 text-left sm:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/5 dark:bg-white/2"
            >
              {feature.icon}
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {feature.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
