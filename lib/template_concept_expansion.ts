/**
 * Concept synonym groups for template query expansion.
 *
 * Maps a normalized query token → { synonyms, suppressWhen? }.
 *
 * `synonyms`    — alternative terms to OR-match in template search blobs.
 * `suppressWhen`— if ANY of these tokens appears in the same query, the
 *                 expansion for this token is skipped entirely. Used to
 *                 prevent country-name cuisine expansions from firing on
 *                 language-learning queries (e.g. "korean" in
 *                 "bilingual flashcards korean fruits" means Korean language,
 *                 not Korean cuisine).
 *
 * Design rules:
 *  - Keep synonyms NARROW: only add terms whose presence in a template blob
 *    strongly implies relevance to the query concept.
 *  - Never add broad terms like "language", "design", or "food" for tokens
 *    that are already ambiguous — these appear incidentally in too many
 *    descriptions and destroy precision.
 *  - Country-as-cuisine modifiers (cuban, thai, …) use "cuisine", "recipe",
 *    and "culinary" — NOT "food" alone — so templates that only mention "food"
 *    tangentially are excluded while recipe/menu templates remain in scope.
 *    They carry suppressWhen guards for language-learning co-signals.
 *  - Food-item nouns (sandwich, burger, …) are allowed to expand to "food"
 *    because they are unambiguously about food content and need no guard.
 *  - Visual style terms (watercolor, vintage, …) are intentionally absent:
 *    style adjectives match too many unrelated illustration templates and
 *    destroy precision for queries like "watercolor map" or "vintage poster".
 */
export type SynonymEntry = {
  synonyms: string[];
  /** If any of these tokens is present in the query, suppress this expansion. */
  suppressWhen?: string[];
};

// Tokens that signal language-learning intent.
// When any of these co-occurs with a country name, the country should be
// interpreted as a language/culture modifier, not a cuisine modifier.
const LANG_LEARNING: string[] = [
  "flashcard", "flashcards", "vocabulary", "bilingual", "multilingual",
  "esl", "learning", "language", "kids", "printable", "worksheet", "lesson",
];

export const CONCEPT_SYNONYMS: Record<string, SynonymEntry> = {
  // ── Bilingual / multilingual equivalence ───────────────────────────────
  bilingual:    { synonyms: ["multilingual"] },
  multilingual: { synonyms: ["bilingual"] },

  // ── Flashcard singular/plural ─────────────────────────────────────────
  flashcard:  { synonyms: ["flashcards"] },
  flashcards: { synonyms: ["flashcard"] },

  // ── Food-item nouns → food/recipe/cuisine category ────────────────────
  // Unambiguous food tokens — no suppressWhen guard needed.
  sandwich: { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  burger:   { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  pizza:    { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  sushi:    { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  pasta:    { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  taco:     { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  ramen:    { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  steak:    { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  salad:    { synonyms: ["food", "recipe", "cuisine", "culinary"] },
  soup:     { synonyms: ["food", "recipe", "cuisine", "culinary"] },

  // ── Country-as-cuisine modifier ────────────────────────────────────────
  // "food" is deliberately EXCLUDED: country names appear in many non-food
  // contexts. suppressWhen guards prevent these from firing when the query
  // is about language learning rather than cuisine.
  cuban:    { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  thai:     { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  korean:   { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  italian:  { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  mexican:  { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  french:   { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  japanese: { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },
  indian:   { synonyms: ["cuisine", "recipe", "culinary"], suppressWhen: LANG_LEARNING },

  // ── Visual style ───────────────────────────────────────────────────────
  // watercolor was removed: "whimsical" and "hand-drawn" match too many
  // unrelated illustration templates, e.g. "Dog Breed Retro Science
  // Infographic" appearing for "watercolor map of europe travel destinations".
  // Add the watercolor-map template topic slug directly instead.
};
