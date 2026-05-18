export type UseCaseTier = "consumer" | "b2b";

export type UseCaseDef = {
  slug: string;
  toolSlugs: string[];
  /** Drives the "Built for teams" badge + "APIs available on request" line
   *  in the use-case hero (see UseCaseClient.tsx). B2B pages also get
   *  packaged-tier copy in bullet3 so the page reads as a sales surface,
   *  not a discovery surface. See docs/interconnection.md "B2B tier". */
  tier: UseCaseTier;
};

// Per-persona tool ordering (most relevant first). Replaces the previous
// uniform mapping where every persona got the same `["video-dubbing",
// "bilingual-subtitles"]` list — see docs/interconnection.md P0 #2.
//
// Each persona's first tool is the headline ToolsGrid card on its use-case
// page. The inverse lookup (which personas list a given tool) drives the
// "Who it's for" chips on each tool detail page.
export const USE_CASES: UseCaseDef[] = [
  // --- Consumer / prosumer personas (SEO long-tail demand capture) ---

  // Parents play dubbed content for kids; subtitles help with reading.
  { slug: "for-parents",      tier: "consumer", toolSlugs: ["bilingual-subtitles", "video-dubbing"] },

  // ESL learners watch listening practice with bilingual subtitles;
  // voice-clone lets them hear their own writing read back.
  { slug: "for-esl-learners", tier: "consumer", toolSlugs: ["bilingual-subtitles", "voice-clone"] },

  // Creators ship dubbed shorts, add subtitles, do quick speech-translate
  // for off-the-cuff captures.
  { slug: "for-creators",     tier: "consumer", toolSlugs: ["video-dubbing", "bilingual-subtitles", "speech-translator"] },

  // Freelance illustrators selling on Etsy / Pinterest / Gumroad — watercolor
  // and vintage-scrapbook printables, fan-art / MBTI character packs, classroom
  // decor sets, fashion mood boards. NOT a fit for brand / logo / UI designers
  // (the catalog has zero of those). No video tools yet match this audience —
  // empty list is honest and lets the use-case page skip the tools section.
  { slug: "for-designers",    tier: "consumer", toolSlugs: [] },

  // --- B2B ICPs (cold-outreach + reference-deal surface) ---
  // Slug kept for SEO continuity; copy and toolSlugs rewritten to target
  // the audience identified in the GTM argument (see docs/interconnection.md).

  // Was "for-marketers" (solo / SMB voice). Now: marketing & growth
  // agencies — white-label content factory, serve 50 clients with the
  // headcount you have for 10. Tools broadened to reflect the multi-vertical
  // breadth an agency ships across.
  { slug: "for-marketers",    tier: "b2b",      toolSlugs: ["video-dubbing", "bilingual-subtitles", "speech-translator"] },

  // Was generic "for-publishers". Now: EdTech & children's publishers —
  // industrial vocab pipeline + format extension + bilingual editions.
  // voice-clone added for TTS audio companion to the K-5 vocab packs.
  { slug: "for-publishers",   tier: "b2b",      toolSlugs: ["bilingual-subtitles", "voice-clone"] },

  // NEW. DTC / cross-border ecommerce — 1 product photo → 100 lifestyle
  // scenes, auto-scheduled. image-translation + style-transfer are the
  // core engine; video-dubbing covers their TikTok/Reels arm.
  { slug: "for-dtc-brands",   tier: "b2b",      toolSlugs: ["image-translation", "style-transfer", "video-dubbing"] },

  // NEW. Programmatic SEO builders — hub-and-spoke generator with original
  // imagery. Horizontal engine play, NOT a template browser — empty
  // toolSlugs (page leads with the meta angle: "we built 5,500 pages of
  // this for ourselves"). Also intentionally absent from
  // topicRegistry.TIER1_USE_CASES for the same reason.
  { slug: "for-programmatic-seo", tier: "b2b",  toolSlugs: [] },
];

export function getUseCaseBySlug(slug: string): UseCaseDef | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}

/** Inverse lookup: which persona slugs include this tool in their list? */
export function getPersonasForTool(toolSlug: string): string[] {
  return USE_CASES
    .filter((uc) => uc.toolSlugs.includes(toolSlug))
    .map((uc) => uc.slug);
}

// Persona → blog categories to surface as "Related reading" on each
// use-case landing page. Source of truth: docs/interconnection.md
// (Persona → Blog categories table). Keep in sync when adding a new
// persona or rebalancing a category's audience fit.
export const PERSONA_BLOG_CATEGORIES: Record<string, string[]> = {
  "for-marketers":         ["content-automation", "creator-tools"],
  "for-parents":           ["learning-education"],
  "for-esl-learners":      ["video-translation-dubbing", "learning-education"],
  "for-creators":          ["creator-tools", "nano-template"],
  "for-designers":         ["nano-template"],
  "for-publishers":        ["nano-template", "learning-education"],
  "for-dtc-brands":        ["content-automation", "creator-tools"],
  "for-programmatic-seo":  ["ds-ai-engineering", "content-automation"],
};
