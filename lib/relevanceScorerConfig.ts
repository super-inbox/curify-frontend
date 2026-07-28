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

// v1.2.0 (2026-07-22): Fix A / Cluster A — format-word-aware query subject
// (lib/searchSubject.ts). No SCORER_WEIGHTS change; subject derivation upstream
// in deriveFieldHits now excludes FORMAT_TOKENS. See docs/search-relevance-v2r3-r1-2026-07-21.md.
export const SCORER_CONFIG_VERSION = "v1.2.0-2026-07-22";

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

// V2-R3 mechanism B (required multi-term coverage + isolated-hit cap --
// see docs/daily_report/7.19/search-relevance-prod-main-v2/v2-r3-root-cause-fix/05_V2_R3_MINIMAL_FIX_DESIGN.md
// section 5). Both apply ONLY to multi-term queries (2+ primary tokens,
// e.g. English "black friday banner", or 2+ CJK bigrams for an
// unsegmented compound like "新品横幅") and are gated OFF for queries
// governed by a protected phrase (lib/searchPhraseProtection.ts already
// has its own narrower anchor-token semantics for those, composed with
// rather than overridden by this mechanism). Single-term queries are
// completely unaffected (coverage of 1/1 is trivial) per the task's
// explicit instruction not to mechanically penalize single-word queries.

// Minimum fraction of a multi-term query's required terms (primary
// tokens, or bigrams for an unsegmented CJK compound) that must be found
// in a candidate's title/tags blob for the query's subject to be
// considered present. A MAJORITY, not all terms: requiring 100% would
// wrongly zero out legitimate results missing one modifier word (e.g. a
// record literally titled "wine" for query "wine label" whose blob
// happens not to literally contain "label"). Calibrated against the
// V2-R3 14-query calibration set only (03_V2_R3_CASE_SPLIT.csv).
export const REQUIRED_TERM_COVERAGE_MIN_RATIO = 0.5;

// Maximum coverage ratio (see above) at or below which a candidate's
// whole-token evidence is considered "isolated" -- i.e. its only real
// signal is a single matched term (or bigram) with no exact-phrase
// corroboration. This is the general, non-blacklist mechanism behind
// the confirmed "banner" -> Marvel "Bruce Banner" MBTI-card and similar
// wrong-sense-collision regressions: a candidate that matches only one
// of a multi-term query's tokens should not score as if it matched the
// whole query. Deliberately the SAME default value as
// REQUIRED_TERM_COVERAGE_MIN_RATIO (see relevanceScorer.scoreRecord for
// why sharing the boundary is intentional -- an exactly-half-covered
// 2-term candidate can still legitimately clear the subject-presence bar
// while its raw score is still capped for being single-signal evidence).
export const ISOLATED_HIT_MAX_COVERAGE_RATIO = 0.5;

// Cap on the COMBINED whole_token_title + whole_token_tags contribution
// when the isolated-hit condition above is met -- prevents a single
// isolated term hit from stacking both the title (18) and tags (8)
// weights (26 total) the way genuine multi-signal agreement does. Set
// equal to whole_token_tags (the medium-signal weight): an isolated hit
// should score like a medium-confidence tag match, not a strong title
// match plus a tag match.
export const ISOLATED_HIT_SCORE_CAP = 8;

// ---------------------------------------------------------------------------
// v1.1 (2026-07-21) — per-path weighting + result-count-aware inclusion.
//
// Motivation (search-eval-07-21 review, see
// docs/search-relevance-v2r3-r1-2026-07-21.md and search-and-content.md
// thread-a): removing V0's binary hasStrict gate let
// NON-ORIGINAL (rewrite / decomposition / relaxed) off-subject candidates flow
// through and score positive on THIN queries — the "笔袋" regression injected
// two western-food posters + two Google-Gemini case-study infographics ABOVE
// the one relevant stationery card, and displaced v0's relevant stationery
// grid. The uniform single-weight schema treats a token match found via a
// rewrite of the query the same as a match on the user's actual query. These
// two knobs make the weighting PATH-DEPENDENT (an extension of the old strict/
// relaxed distinction, not a return to the binary gate) and add a
// result-count-aware inclusion rule, per the reviewer's directive:
//   "对返回结果多的 query 用打分+过滤把最相关的排上来、很不相关的过滤掉;
//    对返回结果少的 query 评分+过滤不影响结果."
// ---------------------------------------------------------------------------

// Per-path trust on the carried-over base_retrieval signal. base_retrieval is
// the pre-existing primaryHits+bigramHits token-overlap count; for a NON-
// ORIGINAL candidate that overlap was measured against a REWRITTEN/decomposed
// query slot, not the user's own query, so it is weaker evidence and is
// trusted at this fraction. Original-query candidates keep full base_retrieval
// (factor 1.0, applied implicitly). Deliberately only discounts the low-weight
// base signal (cap 20) — the high-signal exact_phrase/whole_token/subject terms
// are path-independent, so a genuinely on-subject rewrite result is barely
// affected while pure token-overlap noise from a rewrite loses its free floor.
export const NON_ORIGINAL_BASE_FACTOR = 0.5;

// Extra demotion added to missing_subject_penalty for an OFF-SUBJECT candidate
// that came from a NON-ORIGINAL (rewrite/decomposition/relaxed) path. This is
// the graded successor to V0's binary hasStrict gate: V0 dropped every
// relaxed-only record once any strict hit existed, which R3 correctly removed
// (it also dropped legitimate on-subject relaxed results). But the ONE profile
// V0's gate was right to drop -- an off-subject record surfaced only by a
// rewrite/decomposition of the query (the 笔袋 western-food + Google-Gemini
// posters) -- must still be demoted below the inclusion floor. This penalty
// applies ONLY when the subject is absent, so on-subject relaxed results (R3's
// whole point) are never touched: subjectPresent short-circuits it in
// relevanceScorer.scoreRecord. Sized so base(≤20·0.5=10)+tags(8)+
// missing_subject(-15)+this(-10) = -7 < the inclusion floor.
export const NON_ORIGINAL_OFFSUBJECT_EXTRA_PENALTY = -10;

// A query is "result-rich" once at least this many candidates are genuinely
// on-subject (subjectPresent AND a positive final_score). For a result-rich
// query, selectFinalCandidates requires NON-ORIGINAL candidates to carry the
// query subject to be included at all — pruning the off-subject tail (the
// promo-poster "第四个结果不相关" case, and the 笔袋 food posters once enough
// real stationery candidates are present). For a result-POOR (thin) query this
// gate never engages, so scoring+filtering does not shrink an already-thin
// result — the Direction-1 never-zero invariant and original-floor invariant
// are untouched. Calibrated to the V2-R3 eval set only, not the full benchmark.
export const RESULT_RICH_MIN_ONSUBJECT = 8;
