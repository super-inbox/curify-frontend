export type UseCaseDef = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  toolSlugs: string[];
};

export const USE_CASES: UseCaseDef[] = [
  {
    slug: "for-marketers",
    title: "For Marketers",
    subtitle: "Generate, scale, and publish content 10x faster",
    description:
      "Stop guessing what works. Turn one idea into dozens of high-performing visuals and videos in minutes — no design skills, no prompt engineering.",
    bullets: [
      "Generate content batches from a single idea",
      "Turn images into short-form videos",
      "Repurpose content across platforms",
      "Download ready-to-post content packs",
    ],
    toolSlugs: ["video-dubbing", "bilingual-subtitles"],
  },
  {
    slug: "for-parents",
    title: "For Parents",
    subtitle: "Help your child learn English in just 5 minutes a day",
    description:
      "Make learning simple, visual, and engaging with AI-generated vocabulary cards and videos. No prep. No searching. Just learn.",
    bullets: [
      "Bilingual vocabulary cards",
      "Visual learning with images",
      "Short learning videos",
      "Ready-to-use learning packs",
    ],
    toolSlugs: ["video-dubbing", "bilingual-subtitles"],
  },
  {
    slug: "for-esl-learners",
    title: "For ESL Learners",
    subtitle: "Learn real English through visual dialogue scenes",
    description:
      "Practice real-life conversations with bilingual support and video-based learning. Learn faster with context, not memorization.",
    bullets: [
      "Learn real-life conversations",
      "Practice with visual context",
      "Watch short dialogue videos",
      "Read bilingual subtitles",
    ],
    toolSlugs: ["bilingual-subtitles", "video-dubbing"],
  },
  {
    slug: "for-creators",
    title: "For Creators",
    subtitle: "Never run out of content ideas again",
    description:
      "Discover, remix, and create stunning visuals in seconds. From inspiration to creation — all in one place.",
    bullets: [
      "Browse Nano Inspiration Cards",
      "Create from character & style templates",
      "Turn images into videos with voice and subtitles",
      "Batch download and remix content",
    ],
    toolSlugs: ["video-dubbing", "bilingual-subtitles"],
  },
];

export function getUseCaseBySlug(slug: string): UseCaseDef | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}
