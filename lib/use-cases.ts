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
// LIVE-ONLY mapping policy: toolSlugs here must point at tools that
// are status="create" or status="demo" in lib/tools-registry.ts.
// Coming-soon tools are excluded so chip clicks never land on a dead
// page. When a coming-soon tool ships, add it back to whichever
// persona lists it belongs in (audit in docs/interconnection.md).
// Reviewed + tightened 2026-05-25.
export const USE_CASES: UseCaseDef[] = [
  // --- Consumer / prosumer personas (SEO long-tail demand capture) ---

  // Parents play dubbed content for kids; subtitles help with reading.
  { slug: "for-parents",      tier: "consumer", toolSlugs: ["bilingual-subtitles", "video-dubbing"] },

  // ESL learners practice listening with bilingual subtitles, transcribe
  // for study notes, and use speech-translate for pronunciation help.
  // voice-clone removed pending tool ship (status=coming_soon).
  { slug: "for-esl-learners", tier: "consumer", toolSlugs: ["bilingual-subtitles", "speech-translator", "video-transcript-generator"] },

  // Creators ship dubbed shorts, add subtitles, do quick speech-translate
  // for off-the-cuff captures, generate transcripts for blog repurposing,
  // summarize long-form for digests, clean up footage, and play with
  // style-transfer for creative experimentation.
  { slug: "for-creators",     tier: "consumer", toolSlugs: ["video-dubbing", "bilingual-subtitles", "speech-translator", "video-transcript-generator", "video-summarizer", "video-enhance", "style-transfer"] },

  // Freelance illustrators selling on Etsy / Pinterest / Gumroad. The
  // visual tools fit (style-transfer for mood boards / palette
  // exploration; manga-translation for fan-art and cross-language
  // illustration). Video tools are still not a fit. NOT a fit for brand
  // / logo / UI designers (the catalog has zero of those).
  { slug: "for-designers",    tier: "consumer", toolSlugs: ["style-transfer", "manga-translation"] },

  // --- B2B ICPs (cold-outreach + reference-deal surface) ---
  // Slug kept for SEO continuity; copy and toolSlugs rewritten to target
  // the audience identified in the GTM argument (see docs/interconnection.md).

  // Was "for-marketers" (solo / SMB voice). Now: marketing & growth
  // agencies — white-label content factory, serve 50 clients with the
  // headcount you have for 10. Tools broadened to reflect the multi-vertical
  // breadth an agency ships across, including transcript and summary
  // workflows for competitor monitoring and content repurposing.
  { slug: "for-marketers",    tier: "b2b",      toolSlugs: ["video-dubbing", "bilingual-subtitles", "speech-translator", "video-transcript-generator", "video-summarizer"] },

  // Was generic "for-publishers". Now: EdTech & children's publishers —
  // industrial vocab pipeline + format extension + bilingual editions.
  // video-dubbing covers audio-companion / video-version of print
  // titles; video-transcript-generator for converting recorded
  // lectures or read-alouds into print transcripts. voice-clone
  // removed pending tool ship (status=coming_soon).
  { slug: "for-publishers",   tier: "b2b",      toolSlugs: ["bilingual-subtitles", "video-dubbing", "video-transcript-generator"] },

  // NEW. DTC / cross-border ecommerce — style-transfer for 1-photo →
  // many-scenes lifestyle generation; video-dubbing for TikTok/Reels;
  // manga-translation for cross-border manga/comic merch SKUs.
  // image-translation removed pending tool ship (status=coming_soon)
  // — was the original headline tool, plan to restore once live.
  { slug: "for-dtc-brands",   tier: "b2b",      toolSlugs: ["style-transfer", "video-dubbing", "manga-translation"] },

  // NEW. Programmatic SEO builders — hub-and-spoke generator with original
  // imagery. Horizontal engine play, NOT a template browser — empty
  // toolSlugs (page leads with the meta angle: "we built 5,500 pages of
  // this for ourselves"). Also intentionally absent from
  // topicRegistry.TIER1_USE_CASES for the same reason.
  { slug: "for-programmatic-seo", tier: "b2b",  toolSlugs: [] },

  // NEW 2026-06-05. Freight forwarders / brokerage SMBs — back-office
  // automation only (BOL parsing, invoice auditing, mailbox-AI for rate
  // stats, carrier-side outreach amplifier). Citation-grade thesis at
  // ~/curify-studio/docs/reddit-demand-mining-logistics-2026-06-05-v3.md
  // — r/FreightBrokers anti-AI sentiment is economically grounded
  // (Vlad 53↑: voice bots in front of carriers = loads cost more,
  // capacity dries up), so positioning is "back-office only, never
  // customer or carrier-facing." Empty toolSlugs because the wedge is
  // a pipeline-level pitch, not a tool-browser pitch. Memory:
  // project_logistics_fde_thesis.md.
  { slug: "for-forwarder-back-office", tier: "b2b", toolSlugs: [] },
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
  "for-forwarder-back-office": ["ds-ai-engineering", "content-automation"],
};
