// Expected error codes returned as values throughout the analysis pipeline.
// Never throw these — model them as return values so they survive the
// Next.js "use cache" serialization boundary without losing type information.
export type AnalysisErrorCode = "USER_NOT_FOUND" | "NO_REPOS" | "RATE_LIMITED" | "UNKNOWN";

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
}

// HTTP status to return for each error code
export const ERROR_HTTP_STATUS: Record<AnalysisErrorCode, number> = {
  USER_NOT_FOUND: 404,
  NO_REPOS: 404,
  RATE_LIMITED: 429,
  UNKNOWN: 500,
};

// Maps a raw GitHub API response status to an AnalysisError
export function githubStatusToError(status: number): AnalysisError {
  if (status === 404) {
    return { code: "USER_NOT_FOUND", message: "User not found" };
  }
  if (status === 403 || status === 429) {
    return {
      code: "RATE_LIMITED",
      message: "GitHub API rate limit exceeded. Try again later.",
    };
  }
  return { code: "UNKNOWN", message: `GitHub API error (${status})` };
}
