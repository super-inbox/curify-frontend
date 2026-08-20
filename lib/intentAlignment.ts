// Intent-alignment signal for the search relevance scorer (Stage 7/9 +).
// Deterministic, no LLM/embeddings — consistent with relevanceScorer's charter.
//
// Problem: a record can keyword-match a query yet serve a different INTENT — an
// english-dialogue-scene "Ordering Coffee", an mbti-animal "cafe", a vocabulary
// "coffee drinks" all match "coffee shop" but are noise for a design/commerce
// query. The existing scorer penalizes MISSING subject, not WRONG intent, so
// these pass. This term demotes cross-intent records, gated so an education
// query never penalizes education records.
import { getOutputIntent } from "./output_intent";
import { SCORER_WEIGHTS } from "./relevanceScorerConfig";

export type QueryIntentBucket = "education" | "design" | "other";

// Topic/tag markers of a cross-domain (non-design/commerce) record.
const OFF_TOPICS = new Set([
  "mbti",
  "personality",
  "vocabulary",
  "dialogue",
  "language",
  "language-english",
  "flashcards",
  "kids-learning",
  "early-childhood-learning",
  "character",
  "anthropomorphic",
  "history",
  "timeline",
  "original-ip",
]);

const EDUCATION_QUERY_RE =
  /vocab|word|单词|词汇|flashcard|phonic|\besl\b|dialogue|homophone|homonym|bilingual|language|反义词|worksheet|拼音|拼读|lesson|grammar|spelling/i;
const DESIGN_QUERY_RE =
  /brand|logo|packaging|mockup|品牌|包装|视觉|\bebc\b|详情图|电商|listing|手册|种草|launch|storefront|signage|menu|identity|moodboard/i;

/** Coarse intent bucket for a raw query. Education wins (safety: never penalize
 *  an education query's education results); then design; else other. */
export function queryIntentBucket(query: string): QueryIntentBucket {
  if (EDUCATION_QUERY_RE.test(query)) return "education";
  if (DESIGN_QUERY_RE.test(query)) return "design";
  return "other";
}

/** Count of a record's off-topic (cross-domain) tags/topics. */
export function offTopicHits(topics: readonly string[], tags: readonly string[]): number {
  let n = 0;
  for (const t of [...topics, ...tags]) if (OFF_TOPICS.has(t.toLowerCase())) n++;
  return n;
}

/**
 * The additive intent-alignment delta for one candidate (0 or negative penalty,
 * plus a small positive boost for on-intent records). Returns 0 for education
 * queries so their results are never demoted.
 */
export function intentAlignmentDelta(
  templateId: string,
  topics: readonly string[],
  tags: readonly string[],
  bucket: QueryIntentBucket,
): number {
  if (bucket === "education") return 0;
  const w = SCORER_WEIGHTS;
  let delta = 0;
  const oi = getOutputIntent(templateId);
  if (oi === "education") delta += w.cross_intent_education_penalty;
  const off = Math.min(offTopicHits(topics, tags), w.off_topic_penalty_max_hits);
  if (off > 0) delta += off * w.off_topic_penalty_per;
  if (oi === "merch" || oi === "print-art" || oi === "social" || oi === "presentation") {
    delta += w.intent_aligned_boost;
  }
  return delta;
}
