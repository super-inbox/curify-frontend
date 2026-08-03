/**
 * Template-type signal for example-page SEO, derived from EXISTING topic tags.
 *
 * Two example archetypes (see docs/template-example-UX design):
 *  - INFO-HEAVY   — each example carries unique, rankable content (an MBTI
 *                   character's analysis, an HSK reading, a culture/recipe
 *                   infographic). The example page IS the SEO asset → index it.
 *  - GENERATOR-DEMO — the example is one thin variation of a design tool
 *                   (an expression sheet, a product mockup, a sticker pack).
 *                   The TEMPLATE (the generator) is the SEO target → noindex the
 *                   example and canonical it to the template page.
 *
 * The classifier reuses the topics templates already carry: a template is
 * info-heavy iff it has at least one KNOWLEDGE/CONTENT topic below. Design/
 * production topics (mockups, merch, stickers, product, branding, …) are NOT in
 * the set, so a pure design template classifies as generator-demo. Verified on
 * 2026-07-31: 258 info-heavy / 88 generator-demo, with the top-impression
 * example pages (all mbti-*) correctly on the info-heavy side.
 *
 * `index_examples` on a template is an explicit override for the rare edge case
 * (e.g. a "celebrity filmography infographic" that reads as design but is really
 * content — set index_examples:true).
 */
export const CONTENT_SIGNAL_TOPICS: ReadonlySet<string> = new Set([
  // knowledge & learning
  "education", "learning", "learning-materials", "study-sheets", "flashcards",
  "science", "history", "language", "vocabulary", "dialogue", "expressions",
  "reading", "information-card", "insight", "guides", "bilingual", "kids-learning",
  // personality
  "mbti", "personality", "quiz",
  // culture & story
  "culture", "cultural-festivals", "quote", "story", "mythology",
  // place & travel
  "travel", "itinerary", "city", "map", "seasonal",
  // food knowledge & comparisons & life-info
  "recipes", "comparison", "finance", "relationship", "nostalgia", "astrology",
]);

/**
 * Whether a template's individual example pages should be indexed (info-heavy)
 * vs noindex'd + canonicaled to the template (generator-demo).
 *
 * @param topics   the template's topics[]
 * @param override optional explicit `index_examples` flag on the template
 */
export function templateExamplesIndexable(
  topics: readonly string[] | null | undefined,
  override?: boolean | null
): boolean {
  if (typeof override === "boolean") return override;
  if (!topics) return false;
  for (const t of topics) {
    if (CONTENT_SIGNAL_TOPICS.has(String(t).toLowerCase())) return true;
  }
  return false;
}
