<!-- markdownlint-disable MD033 -->

# <img src="app/icon.svg" width="32" height="32" alt="Dev Roast" align="center" /> Dev Roast

<!-- markdownlint-enable MD033 -->

Get your GitHub profile roasted. Enter a username, get a developer archetype, roast score, and a shareable card - all powered by real repo analysis, not AI hallucinations.

![Dev Roast](public/img.png)

## Features

- **7 Developer Archetypes** - The Experimenter, Indie Hacker, Tutorial Collector, Open Source Monk, Overengineer Supreme, The Polyglot, One-Trick Pony
- **Smart Scoring** - Weighted analysis of maturity, consistency, engagement, documentation, and stability
- **60+ Roast Templates** - Viral-worthy, developer-focused humor across all archetypes and score ranges
- **Shareable Cards** - Export your roast result as a PNG image
- **OG Image Generation** - Dynamic Open Graph images for social sharing
- **Edge Caching** - Next.js 16 caching for fast, snappy profile loads
- **Dark / Light Theme** - Follows system preference with manual toggle

## How It Works

1. Enter a GitHub username
2. The engine fetches public repos, then filters out forks
3. A "hybrid relevance" score ranks repos (Stars × 3 + Forks × 5 + Recency Bonus + Size Bonus)
4. Top 10 repos get deep analysis (fetching READMEs and Releases)
5. Repos are scored individually (engagement, maintenance, stability, documentation)
6. Developer metrics are computed (maturity ratio, abandonment ratio, language diversity, etc.)
7. A personality archetype is detected based on metric patterns
8. A final score (1–10) is calculated and a matching roast template is picked
9. You get roasted 🔥

## Architecture

- **Next.js 16 (App Router)** with Turbopack
- **Tailwind CSS** + **Lucide Icons**
- **Framer Motion** for UI flair
- **CDN Caching** - GitHub API analysis is aggressively cached for 24 hours per username, but roast text randomization is generated fresh on every page load.
