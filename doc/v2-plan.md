# Dev Roast — v2 Plan

Future improvements and optimizations to consider for the next major iteration.

---

## 1. Server-Side Data Fetching (Remove Client-Side API Roundtrip)

### Problem

The results page currently loads as an empty shell with a skeleton loader. The browser has to:

1. Download and parse the JavaScript bundle
2. Hydrate the React components
3. Fire a `fetch("/api/analyze?username=...")` request from the client
4. Wait for the API to call GitHub, run analysis, and respond
5. Only then render the actual result card

This creates a noticeable delay between page load and content display, especially on slower connections.

### Proposed Solution

Move data fetching into the **server component** (`app/results/[username]/page.tsx`) and pass the result as props to the client component. Since `getCachedAnalysis()` already uses Next.js `"use cache"`, the server can serve cached results instantly.

#### Current Architecture

```
Browser → Server (empty HTML + JS) → Client fetch /api/analyze → GitHub API → Render
```

#### Proposed Architecture

```
Browser → Server (calls getCachedAnalysis + renders full HTML) → Client hydrates instantly
```

### Benefits

- **Faster perceived load** — HTML arrives with data already embedded, no second roundtrip
- **SEO improvement** — search engines see actual content instead of a skeleton
- **CDN cache leverage** — repeat visits for the same username are served from edge cache
- **Simpler client code** — removes the fetch state machine (loading/error/success) from `results-content.tsx`

### Considerations

- Error handling (404 user, rate limits) moves from API responses to server component error boundaries
- Loading UX shifts from instant page + skeleton to Suspense streaming (browser shows loading bar until server responds)
- Roast randomization must stay outside the cache boundary so each visit gets a fresh roast

### Implementation Outline

1. In `page.tsx`, call `getCachedAnalysis()` directly inside the server component
2. Call `generateRoast()` separately (uncached) to keep roasts fresh
3. Pass the full `AnalysisResult` as a prop to the client component
4. Wrap the server component in `<Suspense fallback={<ResultSkeleton />}>` for streaming
5. Add an `error.tsx` boundary to handle GitHub API errors gracefully
6. Remove the `/api/analyze` route (or keep it as a public API)

---

## 2. Commit Activity via GitHub Events API (Optional)

### Problem

Commit activity was removed in v1 because `fetchCommitActivity()` required 10 extra API calls (one per repo) and only covered the top 10 repos, making the metric unreliable.

### Proposed Solution

Use the **GitHub Events API** instead:

```
GET /users/{username}/events
```

This is a **single API call** that returns the last 90 days of push events across **all repos**, including exact commit counts.

### Benefits

- Accurate commit data across all repos (not just top 10)
- Only 1 extra API call instead of 10
- Covers 90 days of activity

- Only covers the last 90 days, not a full year

---

## 3. Scale API Limits for Full Repo Analysis

### Problem

Currently, Dev Roast limits analysis to a user's **top 10 public repositories**. This is an artificial limit caused by the limitations of the GitHub REST API:

1. **The N+1 Problem:** Fetching 100 repositories requires 1 request for the repo list, plus 100 individual requests to fetch the `README.md` and languages for each repo.
2. **Rate Limits:** We currently use a Personal Access Token (PAT) which limits us to 5,000 requests per hour. If one user triggers 100+ requests, the app's rate limit would be exhausted by just ~40 users per hour.
3. **Latency:** Firing 100 parallel HTTP requests from the backend causes massive latency spikes and increases the risk of timeouts or abuse-blocking from GitHub.

### Proposed Solution

To achieve **Full Repo Analysis** (analyzing all of a user's repositories) without hitting rate limits or crashing the app, we need to implement two architectural changes: **GraphQL** and **GitHub App Authentication**.

#### Step A: Migrate to GitHub GraphQL API

Instead of making 100+ separate REST calls, the GraphQL API allows us to fetch everything in **one single request**.

- **Query Structure:** We can request up to 100 repositories, including their star counts, primary languages, fork status, AND the raw text of their `README.md` files in one payload.
- **Benefits:**
  - Drops network latency dramatically (1 HTTP connection instead of 100).
  - Uses the GraphQL "point" limit system, which is incredibly efficient for fetching nested data compared to REST request counting.

#### Step B: Authenticate as a GitHub App

Instead of relying on a Personal Access Token (5,000 limit) or unauthenticated requests (60 limit), the backend should be registered as a GitHub App.

- **Implementation:** The Next.js backend generates a short-lived JWT installation token to authenticate requests.
- **Benefits:**
  - Increases the baseline rate limit to **12,500 points/requests per hour** (for non-enterprise usage).
  - Scales automatically if installed on organizational accounts.

### Implementation Outline

1. Design and test a GraphQL query payload that fetches `User -> repositories -> [stargazers, forkCount, languages, object(expression: "HEAD:README.md")]`.
2. Replace the multiple `fetch` calls in `lib/github.ts` with a single `graphql-request` call.
3. Register a GitHub App, download the private key, and set up a token generation utility in the backend using an NPM library like `octokit/auth-app`.
4. Update the UI to reflect that "All Public Repositories" are now being analyzed.
