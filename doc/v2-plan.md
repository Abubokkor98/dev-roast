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

### Limitation

- Only covers the last 90 days, not a full year
