import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Skull } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultErrorProps {
  message: string;
}

export function ResultError({ message }: ResultErrorProps) {
  const router = useRouter();

  return (
    <motion.div
      className="flex flex-col items-center gap-4 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Skull className="h-12 w-12 text-zinc-400" />
      <h2 className="text-xl font-bold">Oops!</h2>
      <p className="max-w-md text-sm text-zinc-500">{message}</p>
      <Button
        onClick={() => router.push("/")}
        variant="outline"
        className="border-red-300 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        Go Home
      </Button>
    </motion.div>
  );
}
