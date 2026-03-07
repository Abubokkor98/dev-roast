import { NextRequest, NextResponse } from "next/server";
import { GitHubError } from "@/lib/github";
import { generateRoast } from "@/lib/roastEngine";
import { getCachedAnalysis } from "@/lib/analysis-cache";
import { AnalysisResult } from "@/types/analysis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  try {
    // Cached: GitHub API calls + analysis (CDN-level, ~24h TTL)
    const cachedData = await getCachedAnalysis(username);

    // Fresh: roast template picked randomly on every request
    const roast = generateRoast(
      cachedData.internalScore,
      cachedData.archetype,
      cachedData.metrics,
    );

    const result: AnalysisResult = {
      username: cachedData.username,
      avatarUrl: cachedData.avatarUrl,
      displayName: cachedData.displayName,
      bio: cachedData.bio,
      metrics: cachedData.metrics,
      topRepos: cachedData.topRepos,
      roast,
      analyzedAt: cachedData.analyzedAt,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GitHubError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error && error.message === "NO_REPOS") {
      return NextResponse.json(
        { error: "This user has no public repositories to analyze" },
        { status: 404 },
      );
    }

    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong analyzing this profile. Please try again.",
      },
      { status: 500 },
    );
  }
}
