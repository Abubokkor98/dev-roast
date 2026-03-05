import { motion } from "motion/react";
import { Flame } from "lucide-react";

export function HomeHero() {
  return (
    <>
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
          <span className="text-red-500">roasted</span> 🔥
        </p>
      </div>

      {/* Description */}
      <p className="max-w-md text-sm leading-relaxed text-zinc-500">
        We analyze your repos, commits, and documentation to uncover your
        developer archetype and give you a roast score. Educational, shareable,
        and slightly painful.
      </p>
    </>
  );
}
