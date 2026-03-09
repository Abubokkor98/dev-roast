"use client";

import { Download, Link } from "lucide-react";
import { domToPng } from "modern-screenshot";
import { toast } from "sonner";
import { ArchetypeName } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExportBarProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  username: string;
  roastScore: number;
  archetypeName: ArchetypeName;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
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
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
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
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Download as PNG"
            size="icon"
            variant="outline"
            onClick={handleExportPng}
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download PNG</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Copy link"
            size="icon"
            variant="outline"
            onClick={handleCopyUrl}
          >
            <Link className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy Link</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Share on X"
            size="icon"
            variant="outline"
            onClick={handleShareOnX}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share on X</TooltipContent>
      </Tooltip>
    </div>
  );
}
