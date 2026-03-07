export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  size: number;
  default_branch: string;
  topics: string[];
}

export interface GitHubReadme {
  content: string;
  encoding: string;
  size: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
}

// export interface CommitWeek {
//   total: number;
//   week: number;
//   days: number[];
// }
