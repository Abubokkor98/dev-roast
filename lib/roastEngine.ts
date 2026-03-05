import {
  DeveloperMetrics,
  DeveloperArchetype,
  RoastResult,
  ArchetypeName,
} from "@/types/analysis";
import { toPublicScore } from "@/lib/scoringEngine";

interface RoastTemplate {
  title: string;
  text: string;
}

type ScoreRange = "low" | "mid" | "high";

function getScoreRange(publicScore: number): ScoreRange {
  if (publicScore <= 3) return "low";
  if (publicScore <= 6) return "mid";
  return "high";
}

const roastTemplates: Record<
  ArchetypeName,
  Record<ScoreRange, RoastTemplate[]>
> = {
  "The Experimenter": {
    low: [
      {
        title: "Repo Hoarder Detected �-�️",
        text: "You create repos like most people create browser tabs - with zero intention of ever coming back to them. Your GitHub is a graveyard of ambition.",
      },
      {
        title: "Commitment Issues: The Repo Edition 💔",
        text: "Your longest relationship with a project lasted 3 commits. Even your README files say 'TODO'. You're speedrunning abandonware.",
      },
    ],
    mid: [
      {
        title: "Jack of All Repos, Master of... Some? 🤹",
        text: "You've got range, I'll give you that. Some of your repos actually have stars. The rest? Let's call them 'creative expression' and move on.",
      },
      {
        title: "The Startup Energy Developer 🚀💨",
        text: "You launch projects with startup energy and maintain them with vacation energy. Somewhere between innovation and chaos, you found your groove.",
      },
    ],
    high: [
      {
        title: "Mad Scientist with Results 🧬",
        text: "Sure, you try everything - but some of it actually sticks. You're the developer equivalent of throwing spaghetti at the wall and somehow building a restaurant.",
      },
    ],
  },
  "Indie Hacker": {
    low: [
      {
        title: "Hustler Without the Muscle 💪",
        text: "You've got the demo links but not the stars. Your projects are like food trucks - lots of branding, questionable reviews, never seen twice.",
      },
    ],
    mid: [
      {
        title: "Small Business Energy 🏪",
        text: "You're shipping products and they're... not terrible! Some people even use them. You're one viral tweet away from indie hacker fame.",
      },
      {
        title: "The Side Project Sommelier 🍷",
        text: "You have excellent taste in projects. Medium engagement, good documentation. You're doing this right - just needs a marketing department (or a Twitter account).",
      },
    ],
    high: [
      {
        title: "Actually Making It Work 💰",
        text: "Stars, forks, demo links, consistent updates - you're living the indie dream. Now stop reading this and go answer those GitHub issues.",
      },
    ],
  },
  "Tutorial Collector": {
    low: [
      {
        title: "Udemy's Best Customer 📺",
        text: "Your GitHub reads like a course catalog. todo-app, weather-app, calculator-app - the holy trinity of 'I'll finish the course later'. Spoiler: you won't.",
      },
      {
        title: "Copy-Paste Archaeologist 📋",
        text: "Every repo is a fossil of some YouTube tutorial. Your commit history is literally 'initial commit' and then radio silence. It's a museum of good intentions.",
      },
    ],
    mid: [
      {
        title: "The Eternal Student 🎓",
        text: "Half your repos are tutorials, but some are showing real growth. You're like a caterpillar that's partway through metamorphosis - exciting and a little gross.",
      },
    ],
    high: [
      {
        title: "Tutorial Graduate 🎉",
        text: "You started as a tutorial follower but actually evolved. Your recent repos show real development muscle. The phoenix rises from the Udemy ashes.",
      },
    ],
  },
  "Open Source Monk": {
    low: [
      {
        title: "Selective but...Quiet 🤫",
        text: "Few repos, few stars - you're the developer equivalent of a quiet person at a party who hasn't said anything interesting yet. Potential? Maybe. Evidence? Minimal.",
      },
    ],
    mid: [
      {
        title: "Quality Over Quantity (Mostly) ⚖️",
        text: "You don't create repos carelessly, and it shows. Your projects have substance and your commits tell a story. Just need a few more chapters.",
      },
    ],
    high: [
      {
        title: "The Zen Master of Code 🧘‍♂️",
        text: "Fewer repos, but each one is a masterpiece. You maintain your projects like bonsai trees - carefully, consistently, beautifully. The open source community bows.",
      },
      {
        title: "Less Is More. Way More. 🏔️",
        text: "While others spam repos, you craft them. High stars, consistent updates, excellent docs. You're proof that restraint is a superpower in software.",
      },
    ],
  },
  "Overengineer Supreme": {
    low: [
      {
        title: "Enterprise Architecture for a To-Do App �-️",
        text: "You set up Kubernetes for a personal blog. Your README has a 12-step deployment guide. Your CI/CD pipeline has more stages than a SpaceX launch. Nobody asked for this.",
      },
      {
        title: "Complexity for Complexity's Sake 🌀",
        text: "Your repos are massive, your stars are microscopic. You build cathedral-grade architecture for convenience-store problems. Beautiful? Yes. Necessary? Absolutely not.",
      },
    ],
    mid: [
      {
        title: "The Architect Who Forgot the Tenants 🏠",
        text: "Your code is over-engineered but honestly pretty impressive. If only someone would actually use it. It's like building a mansion in the middle of a desert - gorgeous, empty.",
      },
    ],
    high: [
      {
        title: "Enterprise Grade (Unironically) 💼",
        text: "Okay, the overengineering actually paid off. Your projects are robust, well-documented, and people are using them. Sometimes the cathedral IS the answer.",
      },
    ],
  },
  "The Polyglot": {
    low: [
      {
        title: "Language Tourist �-�️",
        text: "You've written Hello World in more languages than most people know exist. Your GitHub is a Rosetta Stone of unfinished projects. Pick a lane. Any lane.",
      },
    ],
    mid: [
      {
        title: "The Multilingual Coder 🌐",
        text: "Python? Check. Rust? Check. Haskell? For some reason, check. You've got breadth and some of your projects even have depth. You're a polyglot with potential.",
      },
      {
        title: "Linguistically Gifted (In Code) �-�️",
        text: "You speak more programming languages than most developers speak human ones. And surprisingly, you're not terrible at any of them.",
      },
    ],
    high: [
      {
        title: "Full-Stack Is an Understatement 🦾",
        text: "You write production code in 6+ languages and somehow maintain quality across all of them. You're not a developer, you're a UN translator for machines.",
      },
    ],
  },
  "One-Trick Pony": {
    low: [
      {
        title: "One Language to Rule the Résumé 📝",
        text: "Your GitHub is a monochrome painting. One language, one style, one way of thinking. It's not loyalty, it's Stockholm Syndrome.",
      },
    ],
    mid: [
      {
        title: "The Specialist 🎯",
        text: "You've picked your lane and you're driving in it competently. Sure, you could branch out - but why fix what generates adequate pull requests?",
      },
    ],
    high: [
      {
        title: "Master of One, and It Shows 🏆",
        text: "You went all-in on one language and it paid off. Your repos are consistent, your expertise runs deep. Sometimes specialization IS the cheat code.",
      },
    ],
  },
};

function pickTemplate(
  archetype: ArchetypeName,
  range: ScoreRange,
): RoastTemplate {
  const templates = roastTemplates[archetype][range];
  if (templates.length === 0) {
    return {
      title: "GitHub Profile Under Review 🔍",
      text: "Not enough roast material in this bucket yet - keep shipping and come back stronger.",
    };
  }
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

function generateHighlights(metrics: DeveloperMetrics): string[] {
  const highlights: string[] = [];

  if (metrics.totalStars > 100) {
    highlights.push(
      `⭐ ${metrics.totalStars} total stars - people actually notice your work`,
    );
  } else if (metrics.totalStars > 20) {
    highlights.push(`⭐ ${metrics.totalStars} stars - not bad, not viral`);
  }

  if (metrics.matureRatio > 0.5) {
    highlights.push(
      `�-️ ${Math.round(metrics.matureRatio * 100)}% of repos are production-ready`,
    );
  }

  if (metrics.activityConsistency > 70) {
    highlights.push("📅 Impressively consistent commit activity");
  }

  if (metrics.languageDiversity.uniqueLanguages >= 5) {
    highlights.push(
      `🌍 Codes in ${metrics.languageDiversity.uniqueLanguages} languages`,
    );
  }

  if (metrics.documentationScore > 70) {
    highlights.push("📝 Actually writes good documentation (rare!)");
  }

  if (metrics.averageCommitsPerWeek > 10) {
    highlights.push(
      `🔥 Averages ${Math.round(metrics.averageCommitsPerWeek)} commits/week`,
    );
  }

  if (metrics.completedRatio > 0.2) {
    highlights.push("✅ Has intentionally completed projects (a rare breed)");
  }

  if (highlights.length === 0) {
    highlights.push("🌱 Just getting started - everyone begins somewhere");
  }

  return highlights.slice(0, 5);
}

function generateTips(metrics: DeveloperMetrics): string[] {
  const tips: string[] = [];

  if (metrics.abandonmentRatio > 0.3) {
    tips.push("Try finishing one project before starting two new ones");
  }

  if (metrics.documentationScore < 40) {
    tips.push(
      "Add a proper README to your top repos - first impressions matter",
    );
  }

  if (metrics.activityConsistency < 30) {
    tips.push("Consistency beats intensity - try smaller, regular commits");
  }

  if (metrics.languageDiversity.uniqueLanguages < 2) {
    tips.push(
      "Explore a second language - it'll make you better at your first one",
    );
  }

  if (metrics.engagementScore < 1) {
    tips.push(
      "Share your work! Good projects with zero visibility stay at zero stars",
    );
  }

  if (metrics.matureRatio < 0.1 && metrics.totalRepos > 10) {
    tips.push("Focus on polishing existing repos instead of creating new ones");
  }

  if (metrics.totalStars > 10 && metrics.documentationScore < 50) {
    tips.push("People found your work - reward them with better documentation");
  }

  if (tips.length === 0) {
    tips.push("Keep doing what you're doing - your GitHub game is solid");
  }

  return tips.slice(0, 4);
}

export function generateRoast(
  internalScore: number,
  archetype: DeveloperArchetype,
  metrics: DeveloperMetrics,
): RoastResult {
  const publicScore = toPublicScore(internalScore);
  const range = getScoreRange(publicScore);
  const template = pickTemplate(archetype.name, range);

  return {
    roastTitle: template.title,
    roastText: template.text,
    roastScore: publicScore,
    archetype,
    highlights: generateHighlights(metrics),
    improvementTips: generateTips(metrics),
  };
}
