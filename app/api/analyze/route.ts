import { NextRequest, NextResponse } from "next/server";
import {
  fetchUser,
  fetchRepos,
  fetchReadme,
  fetchReleases,
  fetchCommitActivity,
  GitHubError,
} from "@/lib/github";
import { analyzeRepo, getAverageCommitsPerWeek } from "@/lib/repoAnalyzer";
import { analyzeDeveloper } from "@/lib/developerAnalyzer";
import { calculateFinalScore } from "@/lib/scoringEngine";
import { detectArchetype } from "@/lib/personalityEngine";
import { generateRoast } from "@/lib/roastEngine";
import { getCached, setCached } from "@/lib/cache";
import { AnalysisResult, RepoAnalysis } from "@/types/analysis";
import { CommitWeek } from "@/types/github";

const TOP_REPOS_TO_ANALYZE = 10;
const RELEASE_STAR_THRESHOLD = 3;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  // Check cache
  const cached = getCached(username);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Fetch user and repos in parallel
    const [user, repos] = await Promise.all([
      fetchUser(username),
      fetchRepos(username),
    ]);

    if (repos.length === 0) {
      return NextResponse.json(
        { error: "This user has no public repositories to analyze" },
        { status: 404 },
      );
    }

    // Sort repos by stars to identify top repos for deep analysis
    const sortedRepos = [...repos].sort(
      (a, b) => b.stargazers_count - a.stargazers_count,
    );
    const topRepos = sortedRepos.slice(0, TOP_REPOS_TO_ANALYZE);

    // Fetch enrichments for top repos in parallel
    const enrichments = await Promise.all(
      topRepos.map(async (repo) => {
        const [readme, releases, commitActivity] = await Promise.all([
          fetchReadme(username, repo.name),
          repo.stargazers_count > RELEASE_STAR_THRESHOLD
            ? fetchReleases(username, repo.name)
            : Promise.resolve([]),
          fetchCommitActivity(username, repo.name),
        ]);

        return { readme, releases, commitActivity };
      }),
    );

    // Analyze top repos with enrichment data
    const topRepoAnalyses: RepoAnalysis[] = topRepos.map((repo, index) =>
      analyzeRepo(repo, enrichments[index]),
    );

    // Analyze remaining repos without enrichment
    const remainingRepos = sortedRepos.slice(TOP_REPOS_TO_ANALYZE);
    const remainingAnalyses: RepoAnalysis[] = remainingRepos.map((repo) =>
      analyzeRepo(repo, { readme: null, releases: [], commitActivity: null }),
    );

    const allAnalyses = [...topRepoAnalyses, ...remainingAnalyses];

    // Collect commit activity from enriched repos
    const allCommitActivity: (CommitWeek[] | null)[] = enrichments.map(
      (e) => e.commitActivity,
    );
    const averageCommitsPerWeek = getAverageCommitsPerWeek(allCommitActivity);

    // Compute developer-level metrics
    const metrics = analyzeDeveloper(user, allAnalyses, averageCommitsPerWeek);

    // Calculate final score
    const internalScore = calculateFinalScore(metrics);

    // Detect archetype
    const archetype = detectArchetype(metrics);

    // Generate roast
    const roast = generateRoast(internalScore, archetype, metrics);

    const result: AnalysisResult = {
      username: user.login,
      avatarUrl: user.avatar_url,
      displayName: user.name || user.login,
      bio: user.bio,
      metrics,
      topRepos: topRepoAnalyses,
      roast,
      analyzedAt: new Date().toISOString(),
    };

    // Cache result
    setCached(username, result);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GitHubError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
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
