"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    router.push(`/results/${trimmed}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-black via-zinc-950 to-black px-4">
      {/* Main content */}
      <motion.div
        className="relative z-10 flex max-w-xl flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-6xl">🔥</span>
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="bg-linear-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
            Dev Roast
          </h1>
          <p className="text-lg text-zinc-400 sm:text-xl">
            Get your GitHub profile brutally{" "}
            <span className="text-orange-400">analyzed</span> and{" "}
            <span className="text-red-400">roasted</span>
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
            placeholder="Enter GitHub username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500"
          />
          <Button
            id="roast-me-button"
            type="submit"
            disabled={!username.trim()}
            className="h-12 bg-linear-to-r from-orange-500 to-red-500 px-6 font-bold text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-40"
          >
            Roast Me 🔥
          </Button>
        </motion.form>

        {/* Features */}
        <motion.div
          className="mt-4 grid grid-cols-2 gap-4 text-left sm:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {[
            { emoji: "📊", label: "Repo Analysis" },
            { emoji: "🧬", label: "Personality" },
            { emoji: "🎯", label: "Roast Score" },
            { emoji: "🎴", label: "Share Card" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/2 px-3 py-2"
            >
              <span className="text-lg">{feature.emoji}</span>
              <span className="text-xs text-zinc-400">{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent" />
    </div>
  );
}
