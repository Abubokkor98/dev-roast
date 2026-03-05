import Link from "next/link";
import { Flame, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>Dev Roast</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link
              href="https://github.com/Abubokkor98/dev-roast"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
