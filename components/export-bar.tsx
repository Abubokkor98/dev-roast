"use client";

import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportBarProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  username: string;
  roastScore: number;
  archetypeName: string;
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
        backgroundColor: "#09090b",
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = `dev-roast-${username}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Card downloaded! 🔥");
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
      `I got roasted by Dev Roast 🔥\nScore: ${roastScore}/10 - "${archetypeName}"`,
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
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleExportPng} size="sm" variant="outline">
          Export PNG
        </Button>
        <Button onClick={handleCopyUrl} size="sm" variant="outline">
          Copy URL
        </Button>
        <Button onClick={handleShareOnX} size="sm" variant="outline">
          Share on X
        </Button>
      </div>
    </div>
  );
}
