"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { AnalysisResult } from "@/types/analysis";
import { Button } from "@/components/ui/button";

interface ShareCardProps {
  data: AnalysisResult;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

export function ShareCard({ data }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const topLanguage = data.metrics.languageDiversity.dominantLanguage;
  const maturePercent = Math.round(data.metrics.matureRatio * 100);

  async function handleDownload() {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `dev-roast-${data.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-linear-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
        >
          {isDownloading ? "Generating..." : "📥 Download Card"}
        </Button>
        <span className="text-xs text-zinc-500">1200×630 PNG</span>
      </div>

      {/* The actual card to capture — positioned off-screen */}
      <div className="overflow-hidden" style={{ height: 0 }}>
        <div
          ref={cardRef}
          style={{
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
            padding: "60px",
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "absolute",
            left: "-9999px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                }}
              >
                🔥
              </div>
              <div>
                <div style={{ fontSize: "36px", fontWeight: 800 }}>
                  Dev Roast
                </div>
                <div style={{ fontSize: "20px", color: "#a1a1aa" }}>
                  @{data.username}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(249, 115, 22, 0.15)",
                border: "2px solid rgba(249, 115, 22, 0.3)",
                borderRadius: "16px",
                padding: "16px 28px",
              }}
            >
              <div
                style={{ fontSize: "48px", fontWeight: 800, color: "#f97316" }}
              >
                {data.roast.roastScore}
              </div>
              <div style={{ fontSize: "14px", color: "#a1a1aa" }}>/ 10</div>
            </div>
          </div>

          {/* Archetype */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            <span style={{ fontSize: "48px" }}>
              {data.roast.archetype.emoji}
            </span>
            <span
              style={{ fontSize: "32px", fontWeight: 700, color: "#f97316" }}
            >
              {data.roast.archetype.name}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "24px", marginTop: "24px" }}>
            {[
              { label: "Repos", value: String(data.metrics.totalRepos) },
              { label: "Stars", value: `⭐ ${data.metrics.totalStars}` },
              { label: "Top Language", value: topLanguage },
              { label: "Mature", value: `${maturePercent}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#a1a1aa",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "auto",
              paddingTop: "20px",
            }}
          >
            <span style={{ fontSize: "16px", color: "#52525b" }}>
              devroast.dev
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
