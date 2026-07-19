// Stage 7/9: unified, lightweight, text-based, deterministic relevance
// scorer. Replaces the ad hoc "score = primaryHits + bigramHits" +
// multiplicative multi-hit-boost + binary hasStrict gate with a single
// explainable weighted score per candidate, used to unify Directions
// 3 (strict/relaxed gate), 4 (phrase/token/substring priority), and 5
// (rewrite path quality) as required by the post-meeting design doc
// section 9-10.
//
// Explicitly NOT implemented (per design doc boundaries + task
// prohibitions): no new LLM calls, no external embeddings, no learned
// reranker, no reliance on human ground truth. Every signal here is a
// deterministic function of text already present in the catalog/query.
//
// Every signal below has direct V0 evidence from
// docs/daily_report/7.19/search-relevance-prod-main-v2/07_V0_TARGET_CASE_RECONFIRMATION.csv
// and 09_SCORE_FEATURE_AUDIT.csv -- see those files for the case-by-case
// justification of each weight's existence. Signals proposed in the
// design doc's candidate list WITHOUT direct V0 evidence (e.g. a
// separate Category/Topic Consistency term beyond what field_support
// already captures, and a standalone "Modifier Coverage" term) are
// deliberately NOT implemented here -- seeing them in the design doc is
// not sufficient justification per the task's explicit instruction not
// to "mechanically implement every candidate feature."

import {
  SCORER_WEIGHTS,
  MIN_SCORE_WHEN_ORIGINAL_NONEMPTY,
  REQUIRED_TERM_COVERAGE_MIN_RATIO,
  ISOLATED_HIT_MAX_COVERAGE_RATIO,
  ISOLATED_HIT_SCORE_CAP,
} from "./relevanceScorerConfig";

export type FieldHitInfo = {
  /** Whole-token (ASCII) or substring (CJK) hit in the record's
   *  title/category blob -- the highest-signal field. */
  titleHit: boolean;
  /** Hit in the tags/topics/search_aliases blob -- medium signal. */
  tagsHit: boolean;
  /** True when the ONLY hit came from the params/description blob
   *  (lowest signal -- mirrors the existing compound-noun demotion
   *  guard's intuition that a param-only hit is weaker evidence). */
  paramsOnlyHit: boolean;
  /** A protected phrase (lib/searchPhraseProtection.ts) or the complete
   *  multi-token query was found verbatim (not just all-tokens-present-
   *  somewhere) in the title/tags blob. */
  exactPhraseHit: boolean;
  /** The record's ONLY match evidence is a CJK bigram/substring fallback
   *  hit with no ASCII whole-token or phrase hit anywhere. */
  substringOnly: boolean;
  /** Whether the query's designated subject/anchor token (protected-
   *  phrase anchor, or the longest primary token / longest bigram for a
   *  single-term query) is present somewhere in title or tags. RAW
   *  signal -- for a multi-term query this is combined with
   *  `coverageRatio` by scoreRecord (see ISOLATED_HIT / coverage-gate
   *  logic below) before it is treated as "subject genuinely present". */
  subjectPresent: boolean;
  /** V2-R3 mechanism B: fraction (0..1) of the query's required terms
   *  found as whole-token hits (or, for an unsegmented CJK compound,
   *  matched bigrams) anywhere in this record's title/tags blob. Always
   *  1 for single-term queries (nothing to cover) -- see
   *  relevanceScorerConfig.ts REQUIRED_TERM_COVERAGE_MIN_RATIO /
   *  ISOLATED_HIT_MAX_COVERAGE_RATIO for how this is used. */
  coverageRatio: number;
};

export type ScoreContext = {
  /** Number of distinct retrieval paths (original + rewrite/decomp
   *  passes) that independently matched this record. */
  pathHits: number;
  templateId: string;
  /** V2-R3 mechanism B: true when the ORIGINAL query decomposes into 2+
   *  required terms (2+ primary tokens, or 2+ bigrams for an
   *  unsegmented CJK compound) -- gates the coverage/isolated-hit logic
   *  below. False for genuine single-term queries, which this mechanism
   *  deliberately does not touch. Query-level, not candidate-level, so
   *  it lives on the context rather than FieldHitInfo. */
  isMultiTermQuery: boolean;
  /** V2-R3 mechanism B: true when the ORIGINAL query contains a
   *  lib/searchPhraseProtection.ts protected phrase. That mechanism
   *  already has its own, narrower anchor-token subject-presence
   *  semantics (a deliberate partial-coverage allowance); the coverage
   *  gate / isolated-hit cap below are skipped entirely for these
   *  queries so the two mechanisms compose without conflict. */
  hasProtectedPhraseQuery: boolean;
};

export type ScoreBreakdown = {
  base_retrieval: number;
  exact_phrase: number;
  whole_token: number;
  path_agreement: number;
  substring_penalty: number;
  missing_subject_penalty: number;
  family_saturation_penalty: number;
  final_score: number;
  reasons: string[];
};

/**
 * Score one candidate record. `baseRetrievalScore` is the pre-existing
 * primaryHits+bigramHits (or 100 for template-promoted strict matches)
 * value computed by page.tsx's scoreBlob -- carried forward rather than
 * discarded so ties within the same signal tier still respect the
 * original token-overlap ordering.
 */
export function scoreRecord(
  fields: FieldHitInfo,
  ctx: ScoreContext,
  baseRetrievalScore: number
): ScoreBreakdown {
  const reasons: string[] = [];
  const w = SCORER_WEIGHTS;

  const base_retrieval = Math.min(baseRetrievalScore, 20) * w.base_retrieval;

  let exact_phrase = 0;
  if (fields.exactPhraseHit) {
    exact_phrase = w.exact_phrase;
    reasons.push("exact_phrase_match_in_title_or_tags");
  }

  let whole_token = 0;
  if (fields.titleHit && !fields.substringOnly) {
    whole_token += w.whole_token_title;
    reasons.push("whole_token_hit_in_title");
  }
  if (fields.tagsHit && !fields.substringOnly) {
    whole_token += w.whole_token_tags;
    reasons.push("whole_token_hit_in_tags");
  }

  // V2-R3 mechanism B (required multi-term coverage): for a multi-term
  // query not governed by a protected phrase, the raw subjectPresent
  // signal (which the caller derives from just the ONE designated
  // subject/anchor token) is only treated as genuine subject presence
  // when coverageRatio also clears a majority threshold -- otherwise a
  // wrong-sense hit on a single token of a multi-word query (e.g.
  // "banner" -> Marvel "Bruce Banner") no longer gets a free pass just
  // because that one token happened to be the longest. Protected-phrase
  // queries keep their existing, narrower anchor-token allowance
  // untouched (see ScoreContext.hasProtectedPhraseQuery doc).
  const coverageGateApplies = ctx.isMultiTermQuery && !ctx.hasProtectedPhraseQuery;
  const subjectPresent = coverageGateApplies
    ? fields.subjectPresent && fields.coverageRatio >= REQUIRED_TERM_COVERAGE_MIN_RATIO
    : fields.subjectPresent;
  if (coverageGateApplies && fields.subjectPresent && !subjectPresent) {
    reasons.push(
      `subject_token_present_but_coverage_${fields.coverageRatio.toFixed(2)}_below_required_${REQUIRED_TERM_COVERAGE_MIN_RATIO}`
    );
  }

  // Cross-path agreement is only credited when the record actually
  // carries the query's core subject. Multiple broad/generic rewrite or
  // decomposition paths (e.g. a single-word "banner" output slot)
  // converging on the SAME popular-tag record is not genuine relevance
  // agreement -- it's exactly the "path count manufactures an
  // unreasonably high score" failure mode Direction 5 explicitly
  // prohibits ("不简单按路径数量累加出不合理高分"). Confirmed live during
  // implementation testing: without this guard, a Marvel "Black Widow"
  // MBTI card matched by 5 paths (mostly via a generic "hero-banner" tag
  // hit) outscored genuinely Black-Friday-relevant content purely on
  // path count, even though missing_subject_penalty correctly fired.
  let path_agreement = 0;
  if (ctx.pathHits > 1 && subjectPresent) {
    path_agreement = Math.min(
      (ctx.pathHits - 1) * w.path_agreement_per_hit,
      w.path_agreement_cap
    );
    reasons.push(`matched_by_${ctx.pathHits}_paths`);
  } else if (ctx.pathHits > 1) {
    reasons.push(`matched_by_${ctx.pathHits}_paths_but_subject_missing_no_bonus`);
  }

  let substring_penalty = 0;
  if (fields.substringOnly) {
    substring_penalty = w.substring_penalty;
    reasons.push("substring_or_bigram_only_no_whole_token_hit");
  }

  let missing_subject_penalty = 0;
  if (!subjectPresent) {
    missing_subject_penalty = w.missing_subject_penalty;
    reasons.push("core_subject_not_present_in_title_or_tags");
  }

  if (fields.paramsOnlyHit) {
    reasons.push("match_relies_on_low_signal_params_field_only");
  }

  // V2-R3 mechanism B (isolated-hit cap): a multi-term-query candidate
  // whose only real evidence is a single matched term/bigram (coverage
  // at or below the isolated threshold) and no exact-phrase
  // corroboration should not stack both the title and tags whole-token
  // weights -- that combination is reserved for genuine multi-signal
  // agreement. Composes with (does not replace) the phrase-protection
  // dictionary: any query with a protected phrase is exempted above via
  // coverageGateApplies, and any candidate with an actual exact-phrase
  // hit is exempted via the !fields.exactPhraseHit check below.
  if (
    coverageGateApplies &&
    !fields.exactPhraseHit &&
    fields.coverageRatio <= ISOLATED_HIT_MAX_COVERAGE_RATIO &&
    whole_token > ISOLATED_HIT_SCORE_CAP
  ) {
    whole_token = ISOLATED_HIT_SCORE_CAP;
    reasons.push("isolated_single_term_hit_capped");
  }

  const final_score =
    base_retrieval +
    exact_phrase +
    whole_token +
    path_agreement +
    substring_penalty +
    missing_subject_penalty;
  // family_saturation_penalty filled in by applyFamilySaturation after
  // the full candidate set is known (it's a pool-level, not per-record,
  // signal).

  return {
    base_retrieval,
    exact_phrase,
    whole_token,
    path_agreement,
    substring_penalty,
    missing_subject_penalty,
    family_saturation_penalty: 0,
    final_score,
    reasons,
  };
}

export type ScoredCandidate = {
  id: string;
  templateId: string;
  breakdown: ScoreBreakdown;
  isOriginal: boolean;
};

/**
 * Direction 5 / design doc 9.2 Template Family Saturation: after the
 * full candidate pool is scored, records are grouped by templateId in
 * CURRENT score order; once a family has already placed
 * `family_saturation_threshold` records ahead of a given record, each
 * additional record from that family gets a growing penalty (capped),
 * pushing later same-family duplicates down without ever excluding the
 * family entirely (soft penalty, not a hard filter -- consistent with
 * "不通过hard filter制造新的零结果").
 *
 * Mutates each candidate's breakdown.family_saturation_penalty and
 * final_score in place, then returns the input array re-sorted by the
 * updated final_score (desc).
 */
export function applyFamilySaturation(candidates: ScoredCandidate[]): ScoredCandidate[] {
  const w = SCORER_WEIGHTS;
  const byScoreDesc = [...candidates].sort(
    (a, b) => b.breakdown.final_score - a.breakdown.final_score
  );
  const familyCount = new Map<string, number>();
  for (const c of byScoreDesc) {
    const seen = familyCount.get(c.templateId) ?? 0;
    familyCount.set(c.templateId, seen + 1);
    if (seen >= w.family_saturation_threshold) {
      const excess = seen - w.family_saturation_threshold + 1;
      const penalty = Math.max(
        excess * w.family_saturation_penalty_per_excess,
        w.family_saturation_penalty_cap
      );
      c.breakdown.family_saturation_penalty = penalty;
      c.breakdown.final_score += penalty;
      c.breakdown.reasons.push(
        `template_family_saturation_rank_${seen + 1}_in_family`
      );
    }
  }
  return byScoreDesc.sort((a, b) => b.breakdown.final_score - a.breakdown.final_score);
}

/**
 * Direction 1 safety filter: given the fully-scored, family-saturation-
 * adjusted candidate pool and the set of record ids that came from the
 * ORIGINAL (non-rewrite) query pass, decide the final included set.
 *
 * Invariant (design doc section 8.1): when original_results is
 * non-empty, every original-pass record must remain in the final pool
 * (existence is a floor -- rank can still move via scoring). Non-
 * original records below MIN_SCORE_WHEN_ORIGINAL_NONEMPTY are dropped
 * ONLY when the original pass already produced at least one record,
 * so this can never itself create a new zero-result case.
 */
// When the original query produced NO results at all, rewrite/
// decomposition paths are the only source of candidates. A quality
// floor still applies here (Direction 3: "Relaxed受最低质量和数量约束，
// 不允许flooding" applies regardless of whether the original was empty)
// -- but capped by a never-zero guarantee: the top N candidates by
// score are always kept even if all of them are below the floor, so
// this filter can never itself turn an already-thin result into zero.
const MIN_KEPT_WHEN_ORIGINAL_EMPTY = 5;
const MIN_SCORE_WHEN_ORIGINAL_EMPTY = -5;

export function selectFinalCandidates(
  scored: ScoredCandidate[],
  originalIds: Set<string>
): ScoredCandidate[] {
  if (originalIds.size === 0) {
    const aboveFloor = scored.filter(
      (c) => c.breakdown.final_score >= MIN_SCORE_WHEN_ORIGINAL_EMPTY
    );
    if (aboveFloor.length >= Math.min(MIN_KEPT_WHEN_ORIGINAL_EMPTY, scored.length)) {
      return aboveFloor;
    }
    // Not enough candidates clear the floor -- never-zero guarantee:
    // take the top-scoring candidates regardless of the floor rather
    // than returning an emptier (or empty) set.
    return [...scored]
      .sort((a, b) => b.breakdown.final_score - a.breakdown.final_score)
      .slice(0, MIN_KEPT_WHEN_ORIGINAL_EMPTY);
  }
  return scored.filter(
    (c) => originalIds.has(c.id) || c.breakdown.final_score >= MIN_SCORE_WHEN_ORIGINAL_NONEMPTY
  );
}
