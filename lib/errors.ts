export class GitHubError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export class NoReposError extends Error {
  constructor() {
    super("This user has no public repositories to analyze");
    this.name = "NoReposError";
  }
}
