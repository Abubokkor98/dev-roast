import { NextRequest, NextResponse } from "next/server";
import { generateRoast } from "@/lib/roastEngine";
import { getCachedAnalysis } from "@/lib/analysis-cache";
import { ERROR_HTTP_STATUS } from "@/lib/errors";
import { AnalysisResult } from "@/types/analysis";

const GITHUB_USERNAME_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username || !GITHUB_USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { error: username ? "Invalid GitHub username" : "Username is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getCachedAnalysis(username);

    if (result.error) {
      const userFacingMessage =
        result.error.code === "USER_NOT_FOUND"
          ? `No GitHub account found for "${username}". Double-check the username and try again.`
          : result.error.message;

      return NextResponse.json(
        { code: result.error.code, error: userFacingMessage },
        { status: ERROR_HTTP_STATUS[result.error.code] },
      );
    }

    // Fresh: roast template picked randomly on every request
    const roast = generateRoast(
      result.data.internalScore,
      result.data.archetype,
      result.data.metrics,
    );

    const response: AnalysisResult = {
      username: result.data.username,
      avatarUrl: result.data.avatarUrl,
      displayName: result.data.displayName,
      bio: result.data.bio,
      metrics: result.data.metrics,
      topRepos: result.data.topRepos,
      roast,
      analyzedAt: result.data.analyzedAt,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { code: "UNKNOWN", error: "Something went wrong. Please try again." },
      { status: ERROR_HTTP_STATUS.UNKNOWN },
    );
  }
}
