export type UseCaseDef = {
  slug: string;
  toolSlugs: string[];
};

export const USE_CASES: UseCaseDef[] = [
  { slug: "for-marketers", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
  { slug: "for-parents", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
  { slug: "for-esl-learners", toolSlugs: ["bilingual-subtitles", "video-dubbing"] },
  { slug: "for-creators", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
  // Freelance illustrators selling on Etsy / Pinterest / Gumroad — watercolor
  // and vintage-scrapbook printables, fan-art / MBTI character packs, classroom
  // decor sets, fashion mood boards. NOT a fit for brand / logo / UI designers
  // (the catalog has zero of those).
  { slug: "for-designers", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
  // Children's book publishers + edtech platforms — format extension of an
  // IP (cards / posters / social) and multilingual K-5 vocabulary series.
  // Strongest fit: pop-culture-MBTI for trade IP + the 30-template language
  // tier-1 for edtech vocabulary modules.
  { slug: "for-publishers", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
];

export function getUseCaseBySlug(slug: string): UseCaseDef | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}
