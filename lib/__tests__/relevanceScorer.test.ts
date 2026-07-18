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
  type ScoredCandidate,
} from "../relevanceScorer";
import { findProtectedPhrases, getAnchorTokens } from "../searchPhraseProtection";

function fields(overrides: Partial<FieldHitInfo> = {}): FieldHitInfo {
  return {
    titleHit: false,
    tagsHit: false,
    paramsOnlyHit: false,
    exactPhraseHit: false,
    substringOnly: false,
    subjectPresent: false,
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
      { pathHits: 1, templateId: "template-world-cup-team-sticker-poster" },
      2,
    );
    const genuineCoffeeMatch = scoreRecord(
      fields({ titleHit: true, tagsHit: true, subjectPresent: true }),
      { pathHits: 1, templateId: "template-vocabulary" },
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
      { pathHits: 5, templateId: "template-mbti-generic" },
      1,
    );
    expect(manyPathsNoSubject.path_agreement).toBe(0);
    expect(manyPathsNoSubject.reasons.some((r) => r.includes("no_bonus"))).toBe(true);
    expect(manyPathsNoSubject.final_score).toBeLessThan(0);
  });

  it("cross-path agreement IS credited when the subject is present", () => {
    const manyPathsWithSubject = scoreRecord(
      fields({ titleHit: true, subjectPresent: true }),
      { pathHits: 4, templateId: "template-vocabulary-coffee" },
      2,
    );
    expect(manyPathsWithSubject.path_agreement).toBeGreaterThan(0);
  });

  it("exact phrase match outweighs a substring-only collision", () => {
    const exact = scoreRecord(
      fields({ titleHit: true, exactPhraseHit: true, subjectPresent: true }),
      { pathHits: 1, templateId: "t1" },
      3,
    );
    const substringOnly = scoreRecord(
      fields({ substringOnly: true, subjectPresent: false }),
      { pathHits: 1, templateId: "t2" },
      3,
    );
    expect(exact.final_score).toBeGreaterThan(substringOnly.final_score);
    expect(substringOnly.substring_penalty).toBeLessThan(0);
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
