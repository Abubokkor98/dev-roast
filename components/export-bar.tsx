"use client";

import { Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { ArchetypeName } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportBarProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  username: string;
  roastScore: number;
  archetypeName: ArchetypeName;
}

export function ExportBar({
  contentRef,
  username,
  roastScore,
  archetypeName,
}: ExportBarProps) {
  async function handleExportPng() {
    if (!contentRef.current) return;

    try {
      const dataUrl = await toPng(contentRef.current, {
        pixelRatio: 2,
        style: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
      });

      const link = document.createElement("a");
      link.download = `dev-roast-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export. Try again.");
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  }

  function handleShareOnX() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `I got roasted by Dev Roast!\nScore: ${roastScore}/10 - "${archetypeName}"`,
    );
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Share
      </p>
      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Share options" size="icon" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={handleExportPng}>
              Export PNG
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCopyUrl}>
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleShareOnX}>
              Share on X
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
