"use client";

import { motion } from "motion/react";
import { BarChart3, Dna, Target, Share2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { HomeHero } from "@/components/home-hero";
import { RoastForm } from "@/components/roast-form";

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
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* GitHub + Theme toggle - top right */}
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <Button asChild size="icon" variant="ghost">
          <a
            href="https://github.com/Abubokkor98/dev-roast"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </Button>
        <ModeToggle />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex max-w-xl flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <HomeHero />
        <RoastForm />

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
