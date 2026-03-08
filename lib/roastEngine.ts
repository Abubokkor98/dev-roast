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
        title: "Repo Hoarder Detected",
        text: "You create repos like most people create browser tabs - with zero intention of ever coming back to them. Your GitHub is a graveyard of ambition.",
      },
      {
        title: "Commitment Issues: The Repo Edition",
        text: "Your longest relationship with a project lasted 3 commits. Even your README files say 'TODO'. You're speedrunning abandonware.",
      },
      {
        title: "git init && git forget",
        text: "Your workflow is git init, one excited commit, then mass extinction. Archaeologists will one day study your GitHub to understand what 'giving up early' looked like at scale.",
      },
      {
        title: "The npm install Developer",
        text: "You install more packages than you write lines of code. Your node_modules folder has more depth than your projects. Your hard drive weeps.",
      },
    ],
    mid: [
      {
        title: "Jack of All Repos, Master of... Some?",
        text: "You've got range, I'll give you that. Some of your repos actually have stars. The rest? Let's call them 'creative expression' and move on.",
      },
      {
        title: "The Startup Energy Developer",
        text: "You launch projects with Series A energy and maintain them with 'we ran out of funding' energy. Somewhere between innovation and chaos, you found your groove.",
      },
      {
        title: "ADHD-Driven Development",
        text: "Your GitHub contribution graph tells the story of a developer who discovers a new framework every 72 hours. Chaotic? Yes. Boring? Never.",
      },
    ],
    high: [
      {
        title: "Mad Scientist with Results",
        text: "Sure, you try everything - but some of it actually sticks. You're the developer equivalent of throwing spaghetti at the wall and somehow building a restaurant.",
      },
      {
        title: "Controlled Chaos Engineer",
        text: "You experiment like a maniac, but somehow your repos have stars and your code actually runs. You've turned ADHD into a development methodology.",
      },
      {
        title: "The Venture Capitalist of Code",
        text: "You diversify your repo portfolio like Warren Buffett diversifies stocks. Most devs call it unfocused. Your star count calls it strategy.",
      },
    ],
  },
  "Indie Hacker": {
    low: [
      {
        title: "Hustler Without the Muscle",
        text: "You've got the demo links but not the stars. Your projects are like food trucks - lots of branding, questionable reviews, never seen twice.",
      },
      {
        title: "Launch Day, Every Day",
        text: "You launch products like confetti - colorful, exciting, and immediately on the floor. Your Product Hunt account has more entries than your user count.",
      },
      {
        title: "README-Driven Development",
        text: "Your READMEs promise the moon. Your actual code delivers a blinking cursor. The gap between your marketing and your product is measured in light-years.",
      },
    ],
    mid: [
      {
        title: "Small Business Energy",
        text: "You're shipping products and they're... not terrible! Some people even use them. You're one viral tweet away from indie hacker fame.",
      },
      {
        title: "The Side Project Sommelier",
        text: "You have excellent taste in projects. Medium engagement, good documentation. You're doing this right - just needs a marketing department (or a Twitter account).",
      },
      {
        title: "Almost Ramen Profitable",
        text: "Your projects have actual users, your commits are consistent, and your demos work. You're the indie hacker equivalent of 'almost making it' - and that's honestly closer than most.",
      },
    ],
    high: [
      {
        title: "Actually Making It Work",
        text: "Stars, forks, demo links, consistent updates - you're living the indie dream. Now stop reading this and go answer those GitHub issues.",
      },
      {
        title: "The Unicorn Solo Dev",
        text: "You ship, people star, contributors appear. You somehow do the work of a 5-person team. Your GitHub is what LinkedIn influencers pretend theirs looks like.",
      },
      {
        title: "Ship It and They Will Come",
        text: "You've actually built the thing, shipped the thing, and people use the thing. In a world of vaporware, you're serving real code. Respect.",
      },
    ],
  },
  "Tutorial Collector": {
    low: [
      {
        title: "Udemy's Best Customer",
        text: "Your GitHub reads like a course catalog. todo-app, weather-app, calculator-app - the holy trinity of 'I'll finish the course later'. Spoiler: you won't.",
      },
      {
        title: "Copy-Paste Archaeologist",
        text: "Every repo is a fossil of some YouTube tutorial. Your commit history is literally 'initial commit' and then radio silence. It's a museum of good intentions.",
      },
      {
        title: "Ctrl+C, Ctrl+Career",
        text: "Your GitHub is a graveyard of followed-along tutorials. You've built the same todo app in 6 frameworks. Your most creative commit message is 'fixed typo in App.js'.",
      },
      {
        title: "The Eternal Beginner",
        text: "You've been 'learning React' for 3 years and your latest repo is... another counter app. At this point, your browser bookmarks bar is doing more engineering than you are.",
      },
    ],
    mid: [
      {
        title: "The Eternal Student",
        text: "Half your repos are tutorials, but some are showing real growth. You're like a caterpillar that's partway through metamorphosis - exciting and a little gross.",
      },
      {
        title: "Tutorial with a Twist",
        text: "You follow tutorials but you actually modify them afterward. That's rare. You're the person who reads the recipe AND adds their own spice. Keep cooking.",
      },
      {
        title: "Breaking Free from the Tutorial Matrix",
        text: "Some of your repos still smell like 'npm create react-app', but the recent ones? Those are YOU. The student is becoming the master. Slowly. Very slowly.",
      },
    ],
    high: [
      {
        title: "Tutorial Graduate",
        text: "You started as a tutorial follower but actually evolved. Your recent repos show real development muscle. The phoenix rises from the Udemy ashes.",
      },
      {
        title: "From Student to Sensei",
        text: "You went from copying code to writing code that others copy. Your GitHub timeline is literally a coming-of-age movie. Someone give this dev a diploma.",
      },
      {
        title: "The Redemption Arc",
        text: "Your early repos are tutorial clones. Your recent repos have stars, tests, and actual users. This is the dev equivalent of a glow-up. We're proud.",
      },
    ],
  },
  "Open Source Monk": {
    low: [
      {
        title: "Selective but... Quiet",
        text: "Few repos, few stars - you're the developer equivalent of a quiet person at a party who hasn't said anything interesting yet. Potential? Maybe. Evidence? Minimal.",
      },
      {
        title: "The Invisible Developer",
        text: "Your GitHub is so quiet, it could be a meditation app. Few repos, fewer interactions. You code in silence, like a monk who took a vow of 'no pushing to remote'.",
      },
      {
        title: "404: Developer Activity Not Found",
        text: "Your contribution graph looks like a ghost town after the WiFi went out. Somewhere in there is a developer - we just can't find the evidence.",
      },
    ],
    mid: [
      {
        title: "Quality Over Quantity (Mostly)",
        text: "You don't create repos carelessly, and it shows. Your projects have substance and your commits tell a story. Just need a few more chapters.",
      },
      {
        title: "The Thoughtful Committer",
        text: "Every repo you create has intention behind it. You're not spamming - you're curating. Your GitHub is a boutique, not a Walmart. Now get some customers.",
      },
      {
        title: "Slow and Steady Codes the Race",
        text: "You ship rarely but when you do, it's solid. You're the sourdough starter of developers - requires patience, but the result has substance.",
      },
    ],
    high: [
      {
        title: "The Zen Master of Code",
        text: "Fewer repos, but each one is a masterpiece. You maintain your projects like bonsai trees - carefully, consistently, beautifully. The open source community bows.",
      },
      {
        title: "Less Is More. Way More.",
        text: "While others spam repos, you craft them. High stars, consistent updates, excellent docs. You're proof that restraint is a superpower in software.",
      },
      {
        title: "The Code Artisan",
        text: "Your repos are maintained, documented, and used. You don't ship often, but when you do, it's like a software drop from a luxury brand. Quality is your love language.",
      },
    ],
  },
  "Overengineer Supreme": {
    low: [
      {
        title: "Enterprise Architecture for a To-Do App",
        text: "You set up Kubernetes for a personal blog. Your README has a 12-step deployment guide. Your CI/CD pipeline has more stages than a SpaceX launch. Nobody asked for this.",
      },
      {
        title: "Complexity for Complexity's Sake",
        text: "Your repos are massive, your stars are microscopic. You build cathedral-grade architecture for convenience-store problems. Beautiful? Yes. Necessary? Absolutely not.",
      },
      {
        title: "Design Patterns Anonymous",
        text: "Your todo app has a Factory, a Singleton, an Observer, and a Strategy pattern. It still doesn't mark tasks as done. But hey, at least it's extensible for a theoretical future that will never come.",
      },
      {
        title: "docker-compose for Hello World",
        text: "You containerized a script that prints 'hello'. You added a reverse proxy. You wrote Terraform configs. The deployment guide is longer than the application. This is a cry for help.",
      },
    ],
    mid: [
      {
        title: "The Architect Who Forgot the Tenants",
        text: "Your code is over-engineered but honestly pretty impressive. If only someone would actually use it. It's like building a mansion in the middle of a desert - gorgeous, empty.",
      },
      {
        title: "Resume-Driven Development",
        text: "GraphQL, microservices, Redis, Kafka - your personal projects use more infrastructure than most startups. The tech choices are impeccable. The users are imaginary.",
      },
      {
        title: "The Senior Engineer Solo Project",
        text: "Your code reviews would make a lead engineer cry tears of joy. Your user count makes the same lead engineer cry tears of sadness. The architecture is there - the audience isn't.",
      },
    ],
    high: [
      {
        title: "Enterprise Grade (Unironically)",
        text: "Okay, the overengineering actually paid off. Your projects are robust, well-documented, and people are using them. Sometimes the cathedral IS the answer.",
      },
      {
        title: "The Mad Genius Was Right",
        text: "Everyone laughed at your 47-file project structure. Now it has stars, forks, and contributors. You over-engineered your way to success. We owe you an apology.",
      },
      {
        title: "When Overkill Becomes Kill",
        text: "You brought a bazooka to a knife fight and somehow won the cooking competition too. Your absurd architecture choices actually scaled. The prophecy was true.",
      },
    ],
  },
  "The Polyglot": {
    low: [
      {
        title: "Language Tourist",
        text: "You've written Hello World in more languages than most people know exist. Your GitHub is a Rosetta Stone of unfinished projects. Pick a lane. Any lane.",
      },
      {
        title: "The Duolingo of Programming",
        text: "You've started projects in 8 languages and finished zero. Your GitHub is a buffet where you took one bite of everything and committed to nothing. Pun intended.",
      },
      {
        title: "Stack Overflow-Driven Language Selection",
        text: "You pick a new language every time you see a trending blog post. Your repos look like a programming language Wikipedia page. 'Hello World' polyglot speedrun: completed.",
      },
    ],
    mid: [
      {
        title: "The Multilingual Coder",
        text: "Python? Check. Rust? Check. Haskell? For some reason, check. You've got breadth and some of your projects even have depth. You're a polyglot with potential.",
      },
      {
        title: "Linguistically Gifted (In Code)",
        text: "You speak more programming languages than most developers speak human ones. And surprisingly, you're not terrible at any of them.",
      },
      {
        title: "The Language Sommelier",
        text: "You pair languages with problems like a sommelier pairs wine with food. 'Ah yes, this microservice calls for a 2023 Rust with notes of async.' Pretentious, but effective.",
      },
    ],
    high: [
      {
        title: "Full-Stack Is an Understatement",
        text: "You write production code in 6+ languages and somehow maintain quality across all of them. You're not a developer, you're a UN translator for machines.",
      },
      {
        title: "The Human Compiler",
        text: "You context-switch between languages like a CPU context-switches between threads - fast, efficient, and slightly terrifying. Your brain runs a custom polyglot runtime.",
      },
      {
        title: "Certified Language Collector",
        text: "Most devs argue about which language is best. You just... use all of them. Production-grade. With tests. You ended the language wars by winning all of them.",
      },
    ],
  },
  "One-Trick Pony": {
    low: [
      {
        title: "One Language to Rule the Resume",
        text: "Your GitHub is a monochrome painting. One language, one style, one way of thinking. It's not loyalty, it's Stockholm Syndrome.",
      },
      {
        title: "The Language Loyalist",
        text: "Your entire GitHub is one color on the language bar. You didn't choose this language - you were chosen, and now you can't escape. Therapy might help.",
      },
      {
        title: "Monolingual and Proud (Worried)",
        text: "Every single repo. Same language. Same patterns. Same commit messages. Your GitHub is a time loop, and nobody's coming to break the cycle.",
      },
    ],
    mid: [
      {
        title: "The Specialist",
        text: "You've picked your lane and you're driving in it competently. Sure, you could branch out - but why fix what generates adequate pull requests?",
      },
      {
        title: "Deep, Not Wide",
        text: "While everyone else chases the new hotness, you're going deeper. Your repos are consistent, your expertise is focused. It's not a limitation - it's a strategy. Probably.",
      },
      {
        title: "One Language, No Regrets",
        text: "You saw the 'which language should I learn' debates and chose violence - by ignoring all of it and shipping in your one true language. Respect (with a hint of concern).",
      },
    ],
    high: [
      {
        title: "Master of One, and It Shows",
        text: "You went all-in on one language and it paid off. Your repos are consistent, your expertise runs deep. Sometimes specialization IS the cheat code.",
      },
      {
        title: "The 10x Single-Language Dev",
        text: "You know your language so well, you've bent it into shapes the creators never imagined. Your repos are a masterclass. Other devs use your code as StackOverflow answers.",
      },
      {
        title: "Built Different (Literally One Way)",
        text: "One language. No distractions. Your GitHub is a temple of focus. You didn't spread thin - you went nuclear on depth, and the stars prove it works.",
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
      title: "GitHub Profile Under Review",
      text: "Not enough roast material in this bucket yet - keep shipping and come back stronger.",
    };
  }
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}
function generateHighlights(metrics: DeveloperMetrics): string[] {
  const highlights: string[] = [];

  if (metrics.totalStars > 100) {
    highlights.push(
      `${metrics.totalStars} total stars - your code is getting more attention than your LinkedIn`,
    );
  } else if (metrics.totalStars > 20) {
    highlights.push(
      `${metrics.totalStars} stars - not viral, but your mom would be proud`,
    );
  }

  if (metrics.matureRatio > 0.5) {
    highlights.push(
      `${Math.round(metrics.matureRatio * 100)}% of your repos are production-ready (flex that in interviews)`,
    );
  }

  if (metrics.activityConsistency > 70) {
    highlights.push(
      "Your commit consistency is scary - do you even take weekends off?",
    );
  }

  if (metrics.languageDiversity.uniqueLanguages >= 5) {
    highlights.push(
      `You code in ${metrics.languageDiversity.uniqueLanguages} languages - your brain is a polyglot runtime`,
    );
  }

  if (metrics.documentationScore > 70) {
    highlights.push(
      "You actually write documentation - rarer than a bug-free deploy",
    );
  }

  if (metrics.completedRatio > 0.2) {
    highlights.push(
      "You've actually completed projects - a mythical creature among developers",
    );
  }

  if (highlights.length === 0) {
    highlights.push(
      "You're just getting started - even senior devs had empty GitHubs once (probably)",
    );
  }

  return highlights.slice(0, 5);
}

function generateTips(metrics: DeveloperMetrics): string[] {
  const tips: string[] = [];

  if (metrics.abandonmentRatio > 0.3) {
    tips.push("Try finishing one project before rage-creating two new ones");
  }

  if (metrics.documentationScore < 40) {
    tips.push(
      "Add READMEs to your top repos - a repo without docs is like a restaurant with no menu",
    );
  }

  if (metrics.activityConsistency < 30) {
    tips.push(
      "Consistency beats binge-coding - 1 commit/day > 50 commits then ghosting for 3 months",
    );
  }

  if (metrics.languageDiversity.uniqueLanguages < 2) {
    tips.push(
      "Try a second language - it won't bite, and it'll make you better at your first one",
    );
  }

  if (metrics.engagementScore < 1) {
    tips.push(
      "Share your work! Great code with zero marketing is just expensive journaling",
    );
  }

  if (metrics.matureRatio < 0.1 && metrics.totalRepos > 10) {
    tips.push(
      "You have 10+ repos but none are polished - time to promote a side project to main character",
    );
  }

  if (metrics.totalStars > 10 && metrics.documentationScore < 50) {
    tips.push(
      "People found your code - reward them with docs so they don't have to read source to understand it",
    );
  }

  if (tips.length === 0) {
    tips.push(
      "Keep doing what you're doing - your GitHub game is genuinely impressive",
    );
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
    highlight: pickRandom(generateHighlights(metrics)),
    improvementTip: pickRandom(generateTips(metrics)),
  };
}
