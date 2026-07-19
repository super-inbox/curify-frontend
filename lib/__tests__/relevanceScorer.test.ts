/**
 * Unit tests for the Stage 7/9 unified relevance scorer
 * (lib/relevanceScorer.ts) and Direction 6 phrase protection
 * (lib/searchPhraseProtection.ts).
 *
 * These lock in the specific behaviors confirmed during implementation
 * against the live V0/V2 servers this session (2026-07-19) -- see
 * docs/daily_report/7.19/search-relevance-prod-main-v2/07_V0_TARGET_CASE_RECONFIRMATION.csv
 * for the original evidence and 12_SCORER_CALIBRATION_RESULTS.csv for
 * the full calibration-set pass/fail table.
 */
import { describe, it, expect } from "vitest";
import {
  scoreRecord,
  applyFamilySaturation,
  selectFinalCandidates,
  type FieldHitInfo,
  type ScoreContext,
  type ScoredCandidate,
} from "../relevanceScorer";
import { findProtectedPhrases, getAnchorTokens } from "../searchPhraseProtection";
import {
  REQUIRED_TERM_COVERAGE_MIN_RATIO,
  ISOLATED_HIT_SCORE_CAP,
} from "../relevanceScorerConfig";

function fields(overrides: Partial<FieldHitInfo> = {}): FieldHitInfo {
  return {
    titleHit: false,
    tagsHit: false,
    paramsOnlyHit: false,
    exactPhraseHit: false,
    substringOnly: false,
    subjectPresent: false,
    coverageRatio: 1,
    ...overrides,
  };
}

// Default context for pre-existing (single-term / not-multi-term) test
// cases below -- explicitly opts OUT of the V2-R3 mechanism B coverage
// gate so these existing, already-confirmed behaviors are unaffected by
// it (isMultiTermQuery: false is also the correct value for every
// existing test here, since none of them represent a multi-term query).
function ctx(overrides: Partial<ScoreContext> = {}): ScoreContext {
  return {
    pathHits: 1,
    templateId: "t",
    isMultiTermQuery: false,
    hasProtectedPhraseQuery: false,
    ...overrides,
  };
}

describe("searchPhraseProtection", () => {
  it("finds 'coffee cup' as a protected phrase", () => {
    expect(findProtectedPhrases("coffee cup")).toEqual(["coffee cup"]);
  });

  it("finds 'black friday' inside a longer query", () => {
    expect(findProtectedPhrases("black friday banner")).toEqual(["black friday"]);
  });

  it("does not false-positive on unrelated queries", () => {
    expect(findProtectedPhrases("plush pillow")).toEqual([]);
    expect(findProtectedPhrases("periodic table")).toEqual([]);
  });

  it("anchor token for 'coffee cup' is 'coffee', not 'cup'", () => {
    expect(getAnchorTokens(["coffee cup"])).toEqual(["coffee"]);
  });

  it("anchor token for 'black friday' is 'friday', not 'black'", () => {
    expect(getAnchorTokens(["black friday"])).toEqual(["friday"]);
  });
});

describe("relevanceScorer.scoreRecord", () => {
  it("a World-Cup-style collision (tagsHit only, subject missing) scores below a genuine coffee match", () => {
    // Reproduces the confirmed live-V0 case: "coffee cup" AND-matching a
    // World Cup poster via scattered token hits with no real subject
    // connection, vs. a genuine "coffee drinks" vocabulary card that
    // carries the anchor token "coffee" but not the literal phrase.
    const worldCupCollision = scoreRecord(
      fields({ tagsHit: true, subjectPresent: false }),
      ctx({ templateId: "template-world-cup-team-sticker-poster" }),
      2,
    );
    const genuineCoffeeMatch = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true }),
      ctx({ templateId: "template-vocabulary" }),
      2,
    );
    expect(genuineCoffeeMatch.final_score).toBeGreaterThan(worldCupCollision.final_score);
    expect(worldCupCollision.missing_subject_penalty).toBeLessThan(0);
    expect(worldCupCollision.reasons).toContain("core_subject_not_present_in_title_or_tags");
  });

  it("cross-path agreement is NOT credited when the subject is missing", () => {
    // Reproduces the confirmed live-V0 case: a Marvel "Black Widow" MBTI
    // card matched by 5 rewrite/decomposition paths (mostly via a
    // generic "hero-banner" tag) for the query "black friday banner" --
    // path count alone must not manufacture a competitive score for an
    // off-subject record (Direction 5: "不简单按路径数量累加出不合理高分").
    const manyPathsNoSubject = scoreRecord(
      fields({ tagsHit: true, subjectPresent: false }),
      ctx({ pathHits: 5, templateId: "template-mbti-generic" }),
      1,
    );
    expect(manyPathsNoSubject.path_agreement).toBe(0);
    expect(manyPathsNoSubject.reasons.some((r) => r.includes("no_bonus"))).toBe(true);
    expect(manyPathsNoSubject.final_score).toBeLessThan(0);
  });

  it("cross-path agreement IS credited when the subject is present", () => {
    const manyPathsWithSubject = scoreRecord(
      fields({ titleHit: true, subjectPresent: true }),
      ctx({ pathHits: 4, templateId: "template-vocabulary-coffee" }),
      2,
    );
    expect(manyPathsWithSubject.path_agreement).toBeGreaterThan(0);
  });

  it("exact phrase match outweighs a substring-only collision", () => {
    const exact = scoreRecord(
      fields({ titleHit: true, exactPhraseHit: true, subjectPresent: true }),
      ctx({ templateId: "t1" }),
      3,
    );
    const substringOnly = scoreRecord(
      fields({ substringOnly: true, subjectPresent: false }),
      ctx({ templateId: "t2" }),
      3,
    );
    expect(exact.final_score).toBeGreaterThan(substringOnly.final_score);
    expect(substringOnly.substring_penalty).toBeLessThan(0);
  });
});

// V2-R3 mechanism A: page.tsx's template-promoted-sibling branch now
// calls the SAME deriveFieldHits helper the non-template branch uses,
// once against the sibling's OWN blob (tier 1) and once against the
// template's blob as a tier-2 fallback ONLY when the sibling has zero
// own descriptive content. These tests exercise scoreRecord with the
// two FieldHitInfo shapes that mechanism produces (a page.tsx-level
// wiring test, not a scoreRecord unit test in isolation) -- the live
// targeted evaluation (calibration queries "figure"/"doll"/"动漫周边"/
// "cultural relic figure") is what confirms page.tsx actually produces
// these shapes for real catalog data; see 08_V2_R3_TARGETED_GATE_RESULT.md.
describe("relevanceScorer.scoreRecord (V2-R3 mechanism A: template-sibling evidence)", () => {
  it("a sibling whose OWN title/tags match the query scores higher than a sibling that only inherited the template match", () => {
    // Same template, same base_retrieval (both template-promoted,
    // score:100 -> capped 20) -- the ONLY difference is per-sibling
    // evidence, exactly mechanism A's intended effect.
    const onTopicSibling = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 }),
      ctx({ templateId: "template-mbti-marvel" }),
      100,
    );
    const unrelatedSibling = scoreRecord(
      fields({ titleHit: false, tagsHit: false, subjectPresent: false, coverageRatio: 0 }),
      ctx({ templateId: "template-mbti-marvel" }),
      100,
    );
    expect(onTopicSibling.final_score).toBeGreaterThan(unrelatedSibling.final_score);
  });

  it("an unrelated sibling does not inherit the on-topic sibling's high score (no flat tagsHit:true for every sibling)", () => {
    const unrelatedSibling = scoreRecord(
      fields({ titleHit: false, tagsHit: false, subjectPresent: false, coverageRatio: 0 }),
      ctx({ templateId: "template-mbti-marvel" }),
      100,
    );
    // Old behavior (tagsHit hardcoded true for every sibling) would have
    // scored this at least base_retrieval(20) + whole_token_tags(8) = 28.
    // Own-blob evidence being genuinely absent must score well below that.
    expect(unrelatedSibling.final_score).toBeLessThan(28);
  });

  it("a sibling with no own content at all still gets a safe (non-catastrophic) template-level fallback score, not a hardcoded uniform high score", () => {
    // Tier 2: sibling has zero own tags/topics/title, template's OWN
    // title/category blob happens to match -- fallback still credits
    // titleHit from the template level (today's pre-existing behavior
    // for the template-level check), same as a real record would get.
    const fallbackWithTemplateTitleMatch = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 }),
      ctx({ templateId: "template-x" }),
      100,
    );
    const fallbackWithoutTemplateTitleMatch = scoreRecord(
      fields({ titleHit: false, tagsHit: true, subjectPresent: false, coverageRatio: 0 }),
      ctx({ templateId: "template-x" }),
      100,
    );
    // Fallback is still a FLOOR (base_retrieval alone keeps it
    // non-catastrophic), never fully zeroed out just for lacking metadata.
    expect(fallbackWithoutTemplateTitleMatch.final_score).toBeGreaterThanOrEqual(0);
    // But the fallback must NOT restore a uniform high score for every
    // sibling -- a fallback candidate whose template title also doesn't
    // match must still score below one whose template title DOES match.
    expect(fallbackWithTemplateTitleMatch.final_score).toBeGreaterThan(
      fallbackWithoutTemplateTitleMatch.final_score
    );
  });

  it("original candidates are still preserved by existence, not by an inflated score (Direction 1 unaffected by mechanism A)", () => {
    // isOriginal is not read by scoreRecord at all -- confirmed by
    // signature; a low-scoring original and a low-scoring non-original
    // score identically here. Existence preservation is
    // selectFinalCandidates' job (tested separately below, unchanged).
    const originalCandidate: ScoredCandidate = {
      id: "orig-1",
      templateId: "template-x",
      isOriginal: true,
      breakdown: scoreRecord(fields({}), ctx({ templateId: "template-x" }), 1),
    };
    const nonOriginalCandidate: ScoredCandidate = {
      id: "other-1",
      templateId: "template-x",
      isOriginal: false,
      breakdown: scoreRecord(fields({}), ctx({ templateId: "template-x" }), 1),
    };
    expect(originalCandidate.breakdown.final_score).toBe(nonOriginalCandidate.breakdown.final_score);
  });
});

// V2-R3 mechanism B: required multi-term coverage + isolated-hit score
// cap (05_V2_R3_MINIMAL_FIX_DESIGN.md section 5). coverageRatio here
// abstracts over EN (fraction of primary tokens matched) and CJK
// (fraction of bigrams matched for an unsegmented compound) --
// page.tsx's computeCoverageRatio is what actually produces this number
// from real tokens; these tests exercise the SCORER's consumption of it.
describe("relevanceScorer.scoreRecord (V2-R3 mechanism B: coverage + isolated-hit cap)", () => {
  it("an isolated single-term hit in a multi-term query is capped (banner -> Bruce Banner shape: 1 of 3 terms matched)", () => {
    const isolatedHit = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 / 3 }),
      ctx({ isMultiTermQuery: true, templateId: "template-mbti-marvel" }),
      1,
    );
    expect(isolatedHit.whole_token).toBe(ISOLATED_HIT_SCORE_CAP);
    expect(isolatedHit.reasons).toContain("isolated_single_term_hit_capped");
  });

  it("majority term coverage in a multi-term query is NOT capped", () => {
    const wellCovered = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 }),
      ctx({ isMultiTermQuery: true, templateId: "template-vocabulary-coffee" }),
      1,
    );
    expect(wellCovered.whole_token).toBeGreaterThan(ISOLATED_HIT_SCORE_CAP);
    expect(wellCovered.reasons).not.toContain("isolated_single_term_hit_capped");
  });

  it("an exact phrase hit is never capped even with low coverage (composes with, does not fight, phrase-based matches)", () => {
    const exactPhraseLowCoverage = scoreRecord(
      fields({
        titleHit: true,
        tagsHit: true,
        exactPhraseHit: true,
        subjectPresent: true,
        coverageRatio: 1 / 3,
      }),
      ctx({ isMultiTermQuery: true, templateId: "template-x" }),
      1,
    );
    expect(exactPhraseLowCoverage.reasons).not.toContain("isolated_single_term_hit_capped");
  });

  it("subject + modifier coverage outscores an isolated wrong-sense hit on the same nominal evidence", () => {
    const subjectPlusModifier = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 }),
      ctx({ isMultiTermQuery: true, templateId: "template-x" }),
      1,
    );
    const isolatedWrongSense = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 / 3 }),
      ctx({ isMultiTermQuery: true, templateId: "template-x" }),
      1,
    );
    expect(subjectPlusModifier.final_score).toBeGreaterThan(isolatedWrongSense.final_score);
  });

  it("sense-collision shape (subject token present but coverage below the required ratio) loses the subject-presence credit", () => {
    // "sale banner" shape: only the longest token ("banner") matched; the
    // OTHER token ("sale") is completely absent -- coverage 1/2 = 0.5
    // hits the boundary; use 1/3 (a 3-term query, e.g. "black friday
    // banner" with only "banner" hit and no protected-phrase anchor) to
    // unambiguously demonstrate the below-threshold case.
    const belowThreshold = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 / 3 }),
      ctx({ isMultiTermQuery: true, templateId: "template-mbti-marvel" }),
      1,
    );
    expect(belowThreshold.missing_subject_penalty).toBeLessThan(0);
    expect(
      belowThreshold.reasons.some((r) => r.startsWith("subject_token_present_but_coverage_"))
    ).toBe(true);
  });

  it("single-word queries are completely unaffected by the coverage gate (isMultiTermQuery: false bypasses it even at low coverageRatio)", () => {
    const singleTermQuery = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 0.1 }),
      ctx({ isMultiTermQuery: false, templateId: "template-x" }),
      1,
    );
    expect(singleTermQuery.missing_subject_penalty).toBe(0);
    expect(singleTermQuery.whole_token).toBeGreaterThan(ISOLATED_HIT_SCORE_CAP);
  });

  it("a protected-phrase query is exempt from the coverage gate and isolated-hit cap (composes with, does not replace, the phrase dictionary)", () => {
    // "coffee cup" shape: anchor token ("coffee") present, satisfying
    // subjectPresent via the existing phrase mechanism, but the OTHER
    // word of the phrase not literally present -> low nominal coverage.
    // The coverage gate must not re-penalize what phrase protection
    // already deliberately allows.
    const protectedPhraseLowCoverage = scoreRecord(
      fields({ titleHit: true, subjectPresent: true, coverageRatio: 1 / 2 }),
      ctx({ isMultiTermQuery: true, hasProtectedPhraseQuery: true, templateId: "template-vocabulary-coffee" }),
      1,
    );
    expect(protectedPhraseLowCoverage.missing_subject_penalty).toBe(0);
    expect(
      protectedPhraseLowCoverage.reasons.some((r) => r.startsWith("subject_token_present_but_coverage_"))
    ).toBe(false);
  });

  it("required coverage threshold is exported and matches the isolated-hit cap boundary (documents the intentional shared 0.5 default)", () => {
    expect(REQUIRED_TERM_COVERAGE_MIN_RATIO).toBe(0.5);
  });

  it("a well-covered CJK compound (bigram-coverage shape: 2 of 3 bigrams matched, e.g. 新品横幅) is not capped", () => {
    const cjkWellCovered = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 2 / 3 }),
      ctx({ isMultiTermQuery: true, templateId: "template-banner-cjk" }),
      1,
    );
    expect(cjkWellCovered.whole_token).toBeGreaterThan(ISOLATED_HIT_SCORE_CAP);
  });

  it("a poorly-covered CJK compound (bigram-coverage shape: 1 of 3 bigrams matched) is capped, same principle as the EN case", () => {
    const cjkPoorlyCovered = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true, coverageRatio: 1 / 3 }),
      ctx({ isMultiTermQuery: true, templateId: "template-banner-cjk" }),
      1,
    );
    expect(cjkPoorlyCovered.whole_token).toBe(ISOLATED_HIT_SCORE_CAP);
  });

  it("whole-token-hit-outweighs-substring-only rule is preserved under mechanism B (multi-term context)", () => {
    const wholeToken = scoreRecord(
      fields({ titleHit: true, subjectPresent: true, coverageRatio: 1 }),
      ctx({ isMultiTermQuery: true, templateId: "t1" }),
      3,
    );
    const substringOnly = scoreRecord(
      fields({ substringOnly: true, subjectPresent: false, coverageRatio: 0 }),
      ctx({ isMultiTermQuery: true, templateId: "t2" }),
      3,
    );
    expect(wholeToken.final_score).toBeGreaterThan(substringOnly.final_score);
  });
});

describe("relevanceScorer.applyFamilySaturation", () => {
  function candidate(id: string, templateId: string, score: number): ScoredCandidate {
    return {
      id,
      templateId,
      isOriginal: false,
      breakdown: {
        base_retrieval: score,
        exact_phrase: 0,
        whole_token: 0,
        path_agreement: 0,
        substring_penalty: 0,
        missing_subject_penalty: 0,
        family_saturation_penalty: 0,
        final_score: score,
        reasons: [],
      },
    };
  }

  it("penalizes records beyond the saturation threshold within the same template family", () => {
    // 10 records from the SAME template, all with identical scores --
    // after the 6th (family_saturation_threshold), each additional one
    // should be pushed down by a growing penalty.
    const many = Array.from({ length: 10 }, (_, i) => candidate(`id-${i}`, "template-x", 50));
    const adjusted = applyFamilySaturation(many);
    const penalized = adjusted.filter((c) => c.breakdown.family_saturation_penalty < 0);
    expect(penalized.length).toBeGreaterThan(0);
    // Later-ranked same-family records should never score HIGHER than
    // earlier ones after adjustment (monotonic non-increasing).
    for (let i = 1; i < adjusted.length; i++) {
      expect(adjusted[i].breakdown.final_score).toBeLessThanOrEqual(
        adjusted[i - 1].breakdown.final_score
      );
    }
  });

  it("does not penalize a diverse pool (different template families)", () => {
    const diverse = Array.from({ length: 10 }, (_, i) => candidate(`id-${i}`, `template-${i}`, 50));
    const adjusted = applyFamilySaturation(diverse);
    expect(adjusted.every((c) => c.breakdown.family_saturation_penalty === 0)).toBe(true);
  });

  it("never excludes a record entirely (soft penalty, not a hard filter)", () => {
    const many = Array.from({ length: 20 }, (_, i) => candidate(`id-${i}`, "template-x", 50));
    const adjusted = applyFamilySaturation(many);
    expect(adjusted.length).toBe(20);
  });
});

describe("relevanceScorer.selectFinalCandidates (Direction 1 floor invariant)", () => {
  function candidate(id: string, score: number): ScoredCandidate {
    return {
      id,
      templateId: "t",
      isOriginal: false,
      breakdown: {
        base_retrieval: 0, exact_phrase: 0, whole_token: 0, path_agreement: 0,
        substring_penalty: 0, missing_subject_penalty: 0, family_saturation_penalty: 0,
        final_score: score, reasons: [],
      },
    };
  }

  it("never drops an original-pass record, even with a very low score", () => {
    const originalIds = new Set(["orig-1"]);
    const scored = [candidate("orig-1", -100), candidate("noise-1", -50)];
    const result = selectFinalCandidates(scored, originalIds);
    expect(result.some((c) => c.id === "orig-1")).toBe(true);
  });

  it("drops low-scoring non-original noise when originals exist", () => {
    const originalIds = new Set(["orig-1"]);
    const scored = [candidate("orig-1", 10), candidate("noise-1", -100)];
    const result = selectFinalCandidates(scored, originalIds);
    expect(result.some((c) => c.id === "noise-1")).toBe(false);
  });

  it("keeps a good non-original candidate when originals exist", () => {
    const originalIds = new Set(["orig-1"]);
    const scored = [candidate("orig-1", 10), candidate("good-1", 20)];
    const result = selectFinalCandidates(scored, originalIds);
    expect(result.some((c) => c.id === "good-1")).toBe(true);
  });

  it("never returns zero results when originalIds is empty and candidates exist (never-zero guarantee)", () => {
    const scored = Array.from({ length: 10 }, (_, i) => candidate(`id-${i}`, -100 + i));
    const result = selectFinalCandidates(scored, new Set());
    expect(result.length).toBeGreaterThan(0);
  });

  it("applies a real quality floor when originalIds is empty but enough candidates clear it", () => {
    const scored = [
      candidate("good-1", 20), candidate("good-2", 15), candidate("good-3", 10),
      candidate("good-4", 8), candidate("good-5", 6),
      candidate("bad-1", -100), candidate("bad-2", -100),
    ];
    const result = selectFinalCandidates(scored, new Set());
    expect(result.some((c) => c.id === "bad-1")).toBe(false);
    expect(result.some((c) => c.id === "bad-2")).toBe(false);
  });
});
