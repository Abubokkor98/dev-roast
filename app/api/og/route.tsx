import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "developer";
  const score = searchParams.get("score") || "5";
  const archetype = searchParams.get("archetype") || "The Experimenter";
  const emoji = searchParams.get("emoji") || "🧪";
  const repos = searchParams.get("repos") || "0";
  const stars = searchParams.get("stars") || "0";
  const topLang = searchParams.get("topLang") || "Unknown";
  const matureRatio = searchParams.get("matureRatio") || "0";

  return new ImageResponse(
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "sans-serif",
        color: "#ffffff",
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "36px", fontWeight: 800 }}>Dev Roast</span>
            <span style={{ fontSize: "20px", color: "#a1a1aa" }}>
              @{username}
            </span>
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
          <span style={{ fontSize: "48px", fontWeight: 800, color: "#f97316" }}>
            {score}
          </span>
          <span style={{ fontSize: "14px", color: "#a1a1aa" }}>/ 10</span>
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
        <span style={{ fontSize: "48px" }}>{emoji}</span>
        <span style={{ fontSize: "32px", fontWeight: 700, color: "#f97316" }}>
          {archetype}
        </span>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "flex", gap: "32px", marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span style={{ fontSize: "32px", fontWeight: 700 }}>{repos}</span>
          <span style={{ fontSize: "14px", color: "#a1a1aa" }}>Repos</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span style={{ fontSize: "32px", fontWeight: 700 }}>⭐ {stars}</span>
          <span style={{ fontSize: "14px", color: "#a1a1aa" }}>
            Total Stars
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span style={{ fontSize: "32px", fontWeight: 700 }}>{topLang}</span>
          <span style={{ fontSize: "14px", color: "#a1a1aa" }}>
            Top Language
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span style={{ fontSize: "32px", fontWeight: 700 }}>
            {matureRatio}%
          </span>
          <span style={{ fontSize: "14px", color: "#a1a1aa" }}>Mature</span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "auto" }}
      >
        <span style={{ fontSize: "16px", color: "#52525b" }}>devroast.dev</span>
      </div>
    </div>,
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    },
  );
}
