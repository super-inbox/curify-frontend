export type UseCaseDef = {
  slug: string;
  toolSlugs: string[];
};

// Per-persona tool ordering (most relevant first). Replaces the previous
// uniform mapping where every persona got the same `["video-dubbing",
// "bilingual-subtitles"]` list — see docs/interconnection.md P0 #2.
//
// Each persona's first tool is the headline ToolsGrid card on its use-case
// page. The inverse lookup (which personas list a given tool) drives the
// "Who it's for" chips on each tool detail page.
export const USE_CASES: UseCaseDef[] = [
  // Marketers ship video campaigns / shorts; subtitles second.
  { slug: "for-marketers", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },

  // Parents play dubbed content for kids; subtitles help with reading.
  { slug: "for-parents", toolSlugs: ["bilingual-subtitles", "video-dubbing"] },

  // ESL learners watch listening practice with bilingual subtitles;
  // voice-clone lets them hear their own writing read back.
  { slug: "for-esl-learners", toolSlugs: ["bilingual-subtitles", "voice-clone"] },

  // Creators ship dubbed shorts, add subtitles, do quick speech-translate
  // for off-the-cuff captures.
  { slug: "for-creators", toolSlugs: ["video-dubbing", "bilingual-subtitles", "speech-translator"] },

  // Freelance illustrators selling on Etsy / Pinterest / Gumroad — watercolor
  // and vintage-scrapbook printables, fan-art / MBTI character packs, classroom
  // decor sets, fashion mood boards. NOT a fit for brand / logo / UI designers
  // (the catalog has zero of those). No video tools yet match this audience —
  // empty list is honest and lets the use-case page skip the tools section.
  { slug: "for-designers", toolSlugs: [] },

  // Children's book publishers + edtech platforms — format extension of an
  // IP (cards / posters / social) and multilingual K-5 vocabulary series.
  // Strongest fit: pop-culture-MBTI for trade IP + the 30-template language
  // tier-1 for edtech vocabulary modules. Bilingual subtitles serve the
  // multilingual editions case.
  { slug: "for-publishers", toolSlugs: ["bilingual-subtitles"] },
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
