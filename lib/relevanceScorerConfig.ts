// Stage 8: frozen scorer weight configuration. Single source of truth for
// all weights used by lib/relevanceScorer.ts -- do not hardcode weights
// anywhere else (design doc 9.2: "评分权重集中配置，单一配置源").
//
// Calibrated against docs/daily_report/7.19/search-relevance-prod-main-v2/11_SCORER_CALIBRATION_SET.csv
// (fixed calibration set only -- NOT tuned against the full 326-query
// benchmark, per the task's explicit prohibition on query-by-query
// overfitting after seeing full results).
//
// See docs/daily_report/7.19/search-relevance-prod-main-v2/13_SCORER_CONFIG_LOCK.json
// for the frozen snapshot (weights + version + calibration-set hash +
// freeze timestamp + adjustment rationale).

export const SCORER_CONFIG_VERSION = "v1.0.0-2026-07-19";

export const SCORER_WEIGHTS = {
  // ---- Positive signals ----
  // Base retrieval score carried over from the existing strict/relaxed
  // primaryHits+bigramHits count -- kept small relative to the new
  // explainable signals below so it nudges rather than dominates.
  base_retrieval: 1.0,
  // Full protected phrase (lib/searchPhraseProtection.ts) or the
  // complete multi-token query found verbatim (word-boundary-checked)
  // in the record's high-signal blob (title/category).
  exact_phrase: 40,
  // Whole-token match ratio in the high-signal blob (title/category),
  // scaled 0..1 by primaryHits/totalTokens.
  whole_token_title: 18,
  // Whole-token match ratio in the medium-signal blob (tags/topics/aliases).
  whole_token_tags: 8,
  // Bonus when 2+ distinct retrieval paths (original/rewrite/decomposition)
  // independently surfaced the same record -- cross-path agreement is a
  // genuine relevance signal, but capped so it can't alone promote an
  // irrelevant record (see PATH_AGREEMENT_CAP below).
  path_agreement_per_hit: 3,
  path_agreement_cap: 12,

  // ---- Negative signals ----
  // Match relied only on a CJK substring/bigram fallback or an ASCII
  // token found only inside a multi-word param value (the existing
  // compound-noun demotion case), not a whole-token/phrase hit in a
  // high-signal field.
  substring_penalty: -22,
  // Query has a recognized core subject (a protected phrase, or the
  // longest primary token) that does NOT appear anywhere in the record's
  // title or tags blob (i.e. only params/description carry a partial
  // match). Distinct from substring_penalty: this fires even on a
  // legitimate whole-token match if that token was a modifier, not the
  // subject.
  missing_subject_penalty: -15,
  // Applied per-record once a template_id family has already contributed
  // this many records to the CURRENT candidate pool before ranking --
  // discourages one large template family from crowding out everything
  // else. See relevanceScorer.applyFamilySaturation.
  family_saturation_threshold: 6,
  family_saturation_penalty_per_excess: -6,
  family_saturation_penalty_cap: -30,
} as const;

// Minimum final_score for a record to be included in the ranked result
// set AT ALL when the original (non-rewrite) query already produced at
// least one candidate -- prevents pure noise from a low-quality rewrite
// path diluting a query that already had legitimate original results.
// Deliberately does NOT apply when original_results is empty (Direction
// 1 invariant: never let a floor rule create a NEW zero-result case).
export const MIN_SCORE_WHEN_ORIGINAL_NONEMPTY = -5;

// Direction 5: per-path and total candidate pool caps.
export const PATH_CANDIDATE_CAP = 40; // max candidates a single non-original path may contribute
export const TOTAL_CANDIDATE_POOL_CAP = 80; // unchanged from V0's existing .slice(0, 80)
