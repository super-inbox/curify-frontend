export type UseCaseDef = {
  slug: string;
  toolSlugs: string[];
};

export const USE_CASES: UseCaseDef[] = [
  { slug: "for-marketers", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
  { slug: "for-parents", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
  { slug: "for-esl-learners", toolSlugs: ["bilingual-subtitles", "video-dubbing"] },
  { slug: "for-creators", toolSlugs: ["video-dubbing", "bilingual-subtitles"] },
];

export function getUseCaseBySlug(slug: string): UseCaseDef | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}
