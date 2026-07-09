/**
 * Regression tests for the Prompt 6 safe-WARN-fix metadata changes.
 *
 * These tests verify that:
 *  1. Correct inspirations gain strict matches via alias/topic metadata.
 *  2. Unrelated siblings do NOT become strict matches for the target queries.
 *  3. Template-description contamination no longer cascades irrelevant
 *     inspirations as strict matches.
 *
 * The tokenizer and scorer logic here mirrors scripts/eval_search.cjs and
 * app/[locale]/(public)/search/page.tsx (scoreQueryTokens inner loop).
 * Keep in sync with any future changes to those files.
 */

import { describe, it, expect } from "vitest";
import inspirationData from "../../public/data/nano_inspiration.json";
import enNano from "../../messages/en/nano.json";
import { applyPhraseAliasRules, PHRASE_ALIAS_RULES } from "../query_phrase_aliases";

// ─── Minimal tokenizer + scorer (mirrors eval_search.cjs) ────────────────────

const STOPWORDS = new Set([
  "the","a","an","of","in","on","is","are","and","or","to","for","with","by",
  "at","as","be","this","that","的","了","和","及",
  "topic","topics","theme","themes","category","categories",
  "insights","highlights","guide","guides",
  // "template" — mirror of app/[locale]/(public)/search/page.tsx STOPWORDS.
  // Every inspiration blob includes r.template_id (literally
  // "template-<slug>"), so the bare word "template" false-positive-matches
  // almost every record.
  "template",
]);

function normalizeForSearch(s: string): string {
  return s.toLowerCase().replace(/×/g, "x");
}

function buildPrimaryTokens(query: string): string[] {
  return normalizeForSearch(query)
    .split(/[\s,，、。.:：=·\/|()\[\]+*]+/)
    .map((w) => w.trim())
    .filter((w) => w && !STOPWORDS.has(w));
}

function tokenInBlob(blob: string, t: string): boolean {
  if (!t) return false;
  if (/[一-龥]/.test(t)) return blob.includes(t);
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(blob);
}

function relaxedThreshold(n: number): number {
  return n <= 1 ? 1 : Math.ceil(n / 2);
}

type InspRecord = {
  id: string;
  template_id?: string;
  tags?: string[];
  topics?: string[];
  search_aliases?: string[];
  params?: Record<string, string>;
  locales?: Record<string, { title?: string; category?: string } | undefined>;
};

type TemplateRecord = {
  category?: string;
  title?: string;
  description?: string;
  content?: { sections?: { what?: string; who?: string } };
};

const INSP = inspirationData as InspRecord[];
const EN_NANO = enNano as Record<string, TemplateRecord>;

/** Build the template blob (category + title + description + sections.what + sections.who). */
function buildTemplateBlob(tid: string): string {
  const e = EN_NANO[tid];
  if (!e) return "";
  const parts = [
    e.category,
    e.title,
    e.description,
    e.content?.sections?.what,
    e.content?.sections?.who,
  ].filter((v): v is string => typeof v === "string" && v.length > 0);
  return normalizeForSearch(parts.join(" "));
}

/** Score a single inspiration against a set of primary tokens. */
function scoreInspiration(
  r: InspRecord,
  tokens: string[]
): { strict: boolean; relaxed: boolean; hits: number } {
  const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [
    l?.title,
    l?.category,
  ]);
  const blob = normalizeForSearch(
    [
      r.id,
      r.template_id ?? "",
      ...(r.tags ?? []),
      ...(r.topics ?? []),
      ...(r.search_aliases ?? []),
      ...Object.values(r.params ?? {}),
      ...localeFields,
    ]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      .join(" ")
  );
  let hits = 0;
  for (const t of tokens) {
    if (tokenInBlob(blob, t)) hits++;
  }
  const strict = hits === tokens.length;
  const relaxed = !strict && hits >= relaxedThreshold(tokens.length);
  return { strict, relaxed, hits };
}

/** Returns the set of template IDs that strictly match the query tokens. */
function strictTemplates(tokens: string[]): Set<string> {
  const strict = new Set<string>();
  for (const [tid] of Object.entries(EN_NANO)) {
    const blob = buildTemplateBlob(tid);
    let hits = 0;
    for (const t of tokens) {
      if (tokenInBlob(blob, t)) hits++;
    }
    if (hits === tokens.length) strict.add(tid);
  }
  return strict;
}

/** Full scoring pass: strict-template cascade + individual scoring. */
function scoreAll(query: string): {
  strictIds: Set<string>;
  relaxedIds: Set<string>;
  effectiveInsp: number;
} {
  const tokens = buildPrimaryTokens(query);
  const strictTpl = strictTemplates(tokens);

  const strictIds = new Set<string>();
  const relaxedIds = new Set<string>();
  for (const r of INSP) {
    if (strictTpl.has(r.template_id ?? "")) {
      strictIds.add(r.id);
      continue;
    }
    const { strict, relaxed } = scoreInspiration(r, tokens);
    if (strict) strictIds.add(r.id);
    else if (relaxed) relaxedIds.add(r.id);
  }
  const matchedIds = strictIds.size > 0 ? strictIds : relaxedIds;
  return { strictIds, relaxedIds, effectiveInsp: matchedIds.size };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function byId(id: string): InspRecord {
  const r = INSP.find((x) => x.id === id);
  if (!r) throw new Error(`inspiration not found: ${id}`);
  return r;
}

// ─── 1. Childhood snacks then vs now ─────────────────────────────────────────

describe("childhood snacks then vs now", () => {
  const QUERY = "childhood snacks then vs now";

  it("exact childhood-snacks inspiration is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-then-vs-now-comparison-infographic-childhood-snacks"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("template is NOT a strict template after description fix", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const tplStrict = strictTemplates(tokens);
    expect(
      tplStrict.has("template-then-vs-now-comparison-infographic")
    ).toBe(false);
  });

  it("unrelated siblings are NOT strict matches", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const siblings = [
      "template-then-vs-now-comparison-infographic-entertainment",
      "template-then-vs-now-comparison-infographic-school-supplies",
      "template-then-vs-now-comparison-infographic-tech-products",
      "template-then-vs-now-comparison-infographic-sun-wukong-arc",
      "template-then-vs-now-comparison-infographic-walter-white-arc",
    ];
    for (const id of siblings) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should NOT be strict`).toBe(false);
    }
  });

  it("full scoring: only 1 strict inspiration (the exact match)", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBe(1);
    expect(strictIds.has("template-then-vs-now-comparison-infographic-childhood-snacks")).toBe(true);
  });
});

// ─── 2. Paris travel itinerary ────────────────────────────────────────────────

describe("paris travel itinerary", () => {
  const QUERY = "paris travel itinerary";

  it("historic-landmarks-of-paris is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-tourist-spot-watercolor-map-infographic-historic-landmarks-of-paris"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("city-miniature-paris is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(byId("template-city-miniature-paris"), tokens);
    expect(strict).toBe(true);
  });

  it("tourist-spot template is NOT a strict template after description fix", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const tplStrict = strictTemplates(tokens);
    expect(
      tplStrict.has("template-tourist-spot-watercolor-map-infographic")
    ).toBe(false);
  });

  it("non-Paris tourist-spot entries are NOT strict matches", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const nonParis = [
      "template-tourist-spot-watercolor-map-infographic-central-park",
      "template-tourist-spot-watercolor-map-infographic-hidden-gems-of-rome",
      "template-tourist-spot-watercolor-map-infographic-walking-tour-of-old-town-kyoto",
      "template-tourist-spot-watercolor-map-infographic-mexican-mole-varieties-map",
    ];
    for (const id of nonParis) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should NOT be strict`).toBe(false);
    }
  });

  it("full scoring: exactly 2 strict inspirations (both Paris)", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBe(2);
    expect(strictIds.has("template-tourist-spot-watercolor-map-infographic-historic-landmarks-of-paris")).toBe(true);
    expect(strictIds.has("template-city-miniature-paris")).toBe(true);
    // No non-Paris city entries should be in strict
    expect(strictIds.has("template-tourist-spot-watercolor-map-infographic-central-park")).toBe(false);
    expect(strictIds.has("template-tourist-spot-watercolor-map-infographic-hidden-gems-of-rome")).toBe(false);
  });
});

// ─── 3. Architecture empire state building ────────────────────────────────────

describe("architecture empire state building", () => {
  const QUERY = "architecture empire state building";

  it("Empire State Building inspiration is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-architecture-empire-state-building"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("Chinese landmark inspirations are NOT strict matches", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const chineseIds = [
      "template-architecture-giant-wild-goose-pagoda",
      "template-architecture-national-stadium-bird-nest",
      "template-architecture-oriental-pearl-tower",
    ];
    for (const id of chineseIds) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should NOT be strict for 'empire state building'`).toBe(false);
    }
  });

  it("full scoring: exactly 1 strict inspiration (Empire State Building)", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBe(1);
    expect(strictIds.has("template-architecture-empire-state-building")).toBe(true);
  });

  it("Chinese architecture inspirations have correct location topics added", () => {
    const pagoda = byId("template-architecture-giant-wild-goose-pagoda");
    const birdNest = byId("template-architecture-national-stadium-bird-nest");
    const pearl = byId("template-architecture-oriental-pearl-tower");
    for (const r of [pagoda, birdNest, pearl]) {
      expect(r.topics).toContain("architecture");
      expect(r.topics).toContain("china");
      expect(r.topics).toContain("learning");
    }
  });
});

// ─── 4. Warmup routine running checklist ─────────────────────────────────────

describe("warmup routine running checklist", () => {
  const QUERY = "warmup routine running checklist";

  it("running warmup inspiration is a strict match after alias addition", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-warmup-routine-running"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("running warmup has checklist alias", () => {
    const r = byId("template-warmup-routine-running");
    const aliases = r.search_aliases ?? [];
    expect(aliases.some((a) => a.toLowerCase().includes("checklist"))).toBe(true);
  });

  it("non-running sport warmups are NOT strict matches", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const others = [
      "template-warmup-routine-gym",
      "template-warmup-routine-swimming",
      "template-warmup-routine-yoga",
      "template-warmup-routine-badminton",
      "template-warmup-routine-basketball",
      "template-warmup-routine-fencing",
    ];
    for (const id of others) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should NOT be strict for running checklist query`).toBe(false);
    }
  });

  it("full scoring: exactly 1 strict inspiration (running)", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBe(1);
    expect(strictIds.has("template-warmup-routine-running")).toBe(true);
  });

  it("all warmup inspirations have sports topic", () => {
    const warmupIds = [
      "template-warmup-routine-gym",
      "template-warmup-routine-running",
      "template-warmup-routine-swimming",
      "template-warmup-routine-yoga",
      "template-warmup-routine-badminton",
      "template-warmup-routine-basketball",
      "template-warmup-routine-fencing",
    ];
    for (const id of warmupIds) {
      const r = byId(id);
      expect(r.topics, `${id} missing sports topic`).toContain("sports");
    }
  });
});

// ─── 5. Vintage stamp collection garden birds ────────────────────────────────

describe("vintage stamp collection garden birds", () => {
  const QUERY = "vintage stamp collection garden birds";

  it("garden-birds stamp is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-vintage-stamp-collection-illustration-garden-birds"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("sibling stamp collections are NOT strict matches (only relaxed)", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const siblings = [
      "template-vintage-stamp-collection-illustration-forest-botanicals",
      "template-vintage-stamp-collection-illustration-insects-butterflies",
      "template-vintage-stamp-collection-illustration-mountain-flora",
      "template-vintage-stamp-collection-illustration-ocean-life",
    ];
    for (const id of siblings) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should NOT be strict for 'garden birds' query`).toBe(false);
    }
  });

  it("sibling stamp collections are relaxed matches (shared family alias)", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const siblings = [
      "template-vintage-stamp-collection-illustration-forest-botanicals",
      "template-vintage-stamp-collection-illustration-insects-butterflies",
      "template-vintage-stamp-collection-illustration-mountain-flora",
      "template-vintage-stamp-collection-illustration-ocean-life",
    ];
    for (const id of siblings) {
      const { relaxed } = scoreInspiration(byId(id), tokens);
      expect(relaxed, `${id} should be relaxed (has vintage+stamp+collection)`).toBe(true);
    }
  });

  it("all stamp inspirations have illustration and nature topics", () => {
    const stampIds = [
      "template-vintage-stamp-collection-illustration-garden-birds",
      "template-vintage-stamp-collection-illustration-forest-botanicals",
      "template-vintage-stamp-collection-illustration-insects-butterflies",
      "template-vintage-stamp-collection-illustration-mountain-flora",
      "template-vintage-stamp-collection-illustration-ocean-life",
    ];
    for (const id of stampIds) {
      const r = byId(id);
      expect(r.topics, `${id} missing illustration`).toContain("illustration");
      expect(r.topics, `${id} missing nature`).toContain("nature");
      expect(r.topics, `${id} missing vintage`).toContain("vintage");
    }
  });

  it("full scoring: exactly 1 strict inspiration (garden-birds)", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBe(1);
    expect(strictIds.has("template-vintage-stamp-collection-illustration-garden-birds")).toBe(true);
  });
});

// ─── 6. Before after kitchen organization makeover ───────────────────────────

describe("before after kitchen organization makeover", () => {
  const QUERY = "before after kitchen organization makeover";

  it("exact kitchen makeover inspiration is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-home-organization-before-after-before-after-kitchen-organization-makeover"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("generic kitchen before-after inspiration is a strict match after alias addition", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(
      byId("template-home-organization-before-after-kitchen"),
      tokens
    );
    expect(strict).toBe(true);
  });

  it("unrelated kitchen vocabulary posters are NOT strict matches", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const vocabIds = [
      "template-kids-vocabulary-poster-kitchen-utensils",
      "template-room-vocabulary-infographic-kitchen",
      "template-vocabulary-kitchen-tools-en-zh",
    ];
    for (const id of vocabIds) {
      const r = INSP.find((x) => x.id === id);
      if (!r) continue; // record may not exist in all catalog versions
      const { strict } = scoreInspiration(r, tokens);
      expect(strict, `${id} should NOT be strict`).toBe(false);
    }
  });

  it("full scoring: exactly 2 strict inspirations (both kitchen before-after)", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBe(2);
    expect(strictIds.has("template-home-organization-before-after-before-after-kitchen-organization-makeover")).toBe(true);
    expect(strictIds.has("template-home-organization-before-after-kitchen")).toBe(true);
  });

  it("exact makeover record has before-after and comparison topics", () => {
    const r = byId("template-home-organization-before-after-before-after-kitchen-organization-makeover");
    expect(r.topics).toContain("before-after");
    expect(r.topics).toContain("comparison");
  });
});

// ─── 7. Contamination guard: evolution snacks infographic still passes ────────

describe("evolution snacks infographic (regression guard)", () => {
  it("still returns moderate+ results (template cascade preserved for snacks)", () => {
    const { effectiveInsp } = scoreAll("evolution snacks infographic");
    // expected=moderate (3+); template cascade via then-vs-now gives 7+ strict
    expect(effectiveInsp).toBeGreaterThanOrEqual(3);
  });

  it("evolution-of-snacks inspiration is a strict individual match", () => {
    const tokens = buildPrimaryTokens("evolution snacks infographic");
    const r = INSP.find((x) => x.id === "template-evolution-timeline-infographic-evolution-of-snacks");
    expect(r).toBeDefined();
    if (r) {
      const { strict } = scoreInspiration(r, tokens);
      expect(strict).toBe(true);
    }
  });
});

// ─── 8. Fix 1: phrase-level protection + alias injection ─────────────────────
//
// Regression tests for lib/query_phrase_aliases.ts, covering both:
//  (a) unit behavior of applyPhraseAliasRules in isolation, and
//  (b) end-to-end scoring against the real catalog, extending this file's
//      tokenizer/scorer with the same alias-group OR-semantics used by
//      scoreBlob in app/[locale]/(public)/search/page.tsx (an alias group
//      counts as ONE required slot, satisfied by ANY member — NOT appended
//      to primary as hard-required AND terms).
//
// Keep in sync with app/[locale]/(public)/search/page.tsx buildSearchTokens
// / scoreBlob and scripts/eval_search.cjs.

function bigramHitThresholdLocal(n: number): number {
  if (n <= 1) return 1;
  if (n <= 3) return 2;
  return 3;
}

function scoreBlobWithAliases(
  blob: string,
  primary: string[],
  aliasGroups: string[][],
  bigrams: string[] = []
): { hits: number; allRequired: boolean; bigramHits: number } {
  let primaryHits = 0;
  for (const t of primary) if (tokenInBlob(blob, t)) primaryHits++;
  let groupHits = 0;
  for (const group of aliasGroups) {
    if (group.some((alt) => tokenInBlob(blob, alt))) groupHits++;
  }
  let bigramHits = 0;
  for (const bg of bigrams) if (blob.includes(bg)) bigramHits++;
  const requiredSlots = primary.length + aliasGroups.length;
  return { hits: primaryHits + groupHits, allRequired: primaryHits + groupHits === requiredSlots, bigramHits };
}

// Full mirror of buildSearchTokens in app/[locale]/(public)/search/page.tsx —
// whitespace-split primary tokens, phrase-rule protect/alias injection, then
// (unless an atomic-entity phrase matched) CJK bigram decomposition when the
// whole query collapsed to one whitespace-free CJK token.
function buildTokensWithPhrases(query: string): { primary: string[]; aliasGroups: string[][]; atomicEntityMatched: boolean; bigrams: string[] } {
  const normalizedQuery = normalizeForSearch(query);
  const rawPrimary = buildPrimaryTokens(query);
  const result = applyPhraseAliasRules(normalizedQuery, rawPrimary);
  const bigrams: string[] = [];
  if (
    !result.atomicEntityMatched &&
    result.primary.length === 1 &&
    /[一-龥]/.test(result.primary[0]) &&
    result.primary[0].length >= 2
  ) {
    const w = result.primary[0];
    for (let i = 0; i < w.length - 1; i++) {
      const bg = w.slice(i, i + 2);
      if (/^[一-龥]{2}$/.test(bg)) bigrams.push(bg);
    }
  }
  return { primary: result.primary, aliasGroups: result.aliasGroups, atomicEntityMatched: result.atomicEntityMatched, bigrams };
}

describe("Fix 1: applyPhraseAliasRules unit behavior", () => {
  it("nct dream: protects 'dream', injects kpop/idol alias group", () => {
    const tokens = buildPrimaryTokens("NCT Dream photocard template");
    const result = applyPhraseAliasRules(normalizeForSearch("NCT Dream photocard template"), tokens);
    expect(result.primary).not.toContain("dream");
    expect(result.primary).toContain("nct");
    expect(result.primary).toContain("photocard");
    // photocard's own single-word rule ALSO fires independently.
    expect(result.aliasGroups.length).toBe(2);
    const flat = result.aliasGroups.flat();
    expect(flat).toContain("kpop");
    expect(flat).toContain("idol");
  });

  it("maker space: protects 'space', injects label/diy alias group", () => {
    const tokens = buildPrimaryTokens("maker space label set printable");
    const result = applyPhraseAliasRules(normalizeForSearch("maker space label set printable"), tokens);
    expect(result.primary).not.toContain("space");
    expect(result.primary).toContain("maker");
    expect(result.aliasGroups.flat()).toContain("diy");
  });

  it("bare 'space' query (no 'maker') is untouched — protection only fires on the full phrase", () => {
    const tokens = buildPrimaryTokens("outer space poster");
    const result = applyPhraseAliasRules(normalizeForSearch("outer space poster"), tokens);
    expect(result.primary).toContain("space");
    expect(result.aliasGroups.length).toBe(0);
  });

  it("bare 'dream' query (no 'nct') is untouched", () => {
    const tokens = buildPrimaryTokens("american dream poster");
    const result = applyPhraseAliasRules(normalizeForSearch("american dream poster"), tokens);
    expect(result.primary).toContain("dream");
    expect(result.aliasGroups.length).toBe(0);
  });

  it("ebc: single-word phrase injects enhanced-brand-content/amazon group", () => {
    const q = "Amazon EBC enhanced brand content layout";
    const result = applyPhraseAliasRules(normalizeForSearch(q), buildPrimaryTokens(q));
    expect(result.aliasGroups.some((g) => g.includes("enhanced brand content"))).toBe(true);
  });

  it("brand story: multi-word phrase requires adjacency", () => {
    const adjacent = applyPhraseAliasRules(
      normalizeForSearch("amazon brand story module"),
      buildPrimaryTokens("amazon brand story module")
    );
    expect(adjacent.aliasGroups.some((g) => g.includes("amazon brand story"))).toBe(true);

    // "brand" ... "content" (not immediately followed by "story") must NOT match.
    const nonAdjacent = applyPhraseAliasRules(
      normalizeForSearch("amazon ebc enhanced brand content layout"),
      buildPrimaryTokens("amazon ebc enhanced brand content layout")
    );
    expect(nonAdjacent.aliasGroups.some((g) => g.includes("amazon brand story"))).toBe(false);
  });

  it("香薰: CJK substring match fires even embedded in a longer unspaced blob", () => {
    const q = "小红书香薰产品种草图";
    const result = applyPhraseAliasRules(normalizeForSearch(q), buildPrimaryTokens(q));
    expect(result.aliasGroups.some((g) => g.includes("aromatherapy"))).toBe(true);
    expect(result.aliasGroups.some((g) => g.includes("diffuser"))).toBe(true);
  });

  it("光与夜之恋: atomic entity flag set, no alias group", () => {
    const spaced = applyPhraseAliasRules(
      normalizeForSearch("光与夜之恋 卡面设计参考图"),
      buildPrimaryTokens("光与夜之恋 卡面设计参考图")
    );
    expect(spaced.atomicEntityMatched).toBe(true);
    expect(spaced.aliasGroups.length).toBe(0);

    const unspaced = applyPhraseAliasRules(
      normalizeForSearch("光与夜之恋卡面设计参考图"),
      buildPrimaryTokens("光与夜之恋卡面设计参考图")
    );
    expect(unspaced.atomicEntityMatched).toBe(true);
  });

  it("glass skin / chrome skincare / launch poster rules fire on the target queries", () => {
    const q1 = "K-beauty glass skin brand launch visual";
    const r1 = applyPhraseAliasRules(normalizeForSearch(q1), buildPrimaryTokens(q1));
    expect(r1.aliasGroups.some((g) => g.includes("k-beauty"))).toBe(true);

    const q2 = "Y2K chrome skincare launch poster";
    const r2 = applyPhraseAliasRules(normalizeForSearch(q2), buildPrimaryTokens(q2));
    expect(r2.aliasGroups.some((g) => g.includes("y2k"))).toBe(true);
    expect(r2.aliasGroups.some((g) => g.includes("product launch poster"))).toBe(true);
  });

  it("every rule's aliasTokens are deduped and lowercased", () => {
    for (const rule of PHRASE_ALIAS_RULES) {
      if (!rule.aliasTokens) continue;
      const lowered = rule.aliasTokens.map((t) => t.toLowerCase());
      expect(new Set(lowered).size).toBe(lowered.length);
    }
  });
});

describe("Fix 1: end-to-end catalog regression — false positives removed", () => {
  it("NCT Dream photocard template: 'Dream of the Red Chamber' is no longer a relaxed match", () => {
    const { primary, aliasGroups } = buildTokensWithPhrases("NCT Dream photocard template");
    // template_id for these is the generic "template-character"; the
    // full "dream-of-the-red-chamber" phrase lives in the inspiration's
    // own `id`, which is what pre-fix bare-"dream" matching latched onto.
    const redChamber = INSP.filter((r) => r.id.includes("dream-of-the-red-chamber"));
    expect(redChamber.length).toBeGreaterThan(0);
    for (const r of redChamber) {
      const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [l?.title, l?.category]);
      const blob = normalizeForSearch(
        [r.id, r.template_id ?? "", ...(r.tags ?? []), ...(r.topics ?? []), ...(r.search_aliases ?? []), ...Object.values(r.params ?? {}), ...localeFields]
          .filter((v): v is string => typeof v === "string" && v.length > 0)
          .join(" ")
      );
      const { hits } = scoreBlobWithAliases(blob, primary, aliasGroups);
      const relaxedThr = primary.length + aliasGroups.length <= 1 ? 1 : Math.ceil((primary.length + aliasGroups.length) / 2);
      expect(hits, `${r.id} should no longer clear the relaxed threshold via bare 'dream'`).toBeLessThan(relaxedThr);
    }
  });

  it("光与夜之恋卡面设计参考图 (unspaced): bigram-collision templates no longer strict-match", () => {
    const normalizedQuery = normalizeForSearch("光与夜之恋卡面设计参考图");
    const rawPrimary = buildPrimaryTokens("光与夜之恋卡面设计参考图");
    const phraseResult = applyPhraseAliasRules(normalizedQuery, rawPrimary);
    expect(phraseResult.atomicEntityMatched).toBe(true);

    // Bigrams must NOT be generated when the atomic-entity guard fires —
    // this is what stops 设计/参考/考图/面设 from coincidentally
    // strict-matching unrelated design/card templates.
    const collisionTemplates = [
      "template-mood-board-interior-designgenerator",
      "template-educational-topic-cheat-sheet-poster",
      "template-theme-color-palette-card",
    ];
    for (const tid of collisionTemplates) {
      const blob = buildTemplateBlob(tid);
      // Without bigram matching, the single unspaced primary token
      // (the whole 12-char string) cannot literally appear in any blob.
      const { allRequired } = scoreBlobWithAliases(blob, phraseResult.primary, phraseResult.aliasGroups);
      expect(allRequired, `${tid} should not strict-match once bigram decomposition is suppressed`).toBe(false);
    }
  });
});

function strictTemplatesWithPhrases(primary: string[], aliasGroups: string[][], bigrams: string[]): Set<string> {
  const bigramThr = bigramHitThresholdLocal(bigrams.length);
  const strict = new Set<string>();
  for (const [tid] of Object.entries(EN_NANO)) {
    const blob = buildTemplateBlob(tid);
    const { allRequired, bigramHits } = scoreBlobWithAliases(blob, primary, aliasGroups, bigrams);
    if (allRequired || bigramHits >= bigramThr) strict.add(tid);
  }
  return strict;
}

// Bigram-aware full scoring pass — same shape as scoreAll but using
// buildTokensWithPhrases (phrase rules + bigram fallback) instead of the
// plain buildPrimaryTokens, so it can score unspaced CJK queries where the
// substring-injected alias group and/or bigram fallback are what actually
// drive the match (buildPrimaryTokens alone has no bigram support and would
// under-report these cases). Includes the same template-strict-cascade
// production uses: when a template's OWN i18n blob strict-matches, every
// inspiration under it is promoted to strict regardless of its own blob.
function scoreAllWithPhrases(query: string): { strictCount: number; relaxedCount: number; effectiveInsp: number } {
  const { primary, aliasGroups, bigrams } = buildTokensWithPhrases(query);
  const bigramThr = bigramHitThresholdLocal(bigrams.length);
  const relaxedThr =
    primary.length + aliasGroups.length <= 1 ? 1 : Math.ceil((primary.length + aliasGroups.length) / 2);
  const strictTpl = strictTemplatesWithPhrases(primary, aliasGroups, bigrams);
  let strictCount = 0;
  let relaxedCount = 0;
  for (const r of INSP) {
    if (strictTpl.has(r.template_id ?? "")) {
      strictCount++;
      continue;
    }
    const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [l?.title, l?.category]);
    const blob = normalizeForSearch(
      [r.id, r.template_id ?? "", ...(r.tags ?? []), ...(r.topics ?? []), ...(r.search_aliases ?? []), ...Object.values(r.params ?? {}), ...localeFields]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .join(" ")
    );
    const { hits, allRequired, bigramHits } = scoreBlobWithAliases(blob, primary, aliasGroups, bigrams);
    if (allRequired || bigramHits >= bigramThr) strictCount++;
    else if (hits >= relaxedThr) relaxedCount++;
  }
  return { strictCount, relaxedCount, effectiveInsp: strictCount > 0 ? strictCount : relaxedCount };
}

describe("Fix 1: alias-group injection does not regress an already-working query", () => {
  it("小红书香薰产品种草图 keeps its existing relaxed-match coverage — not diluted by the new English alias group", () => {
    // NOTE: this file's buildTemplateBlob (pre-existing helper) only scans
    // messages/en/nano.json, so the zh-authored template blob that
    // scripts/eval_search.cjs's bigram cascade finds (en+zh scan → 23
    // strict via template promotion — see scripts/configs/search_eval_set.json
    // notes for this query) isn't reachable here. This test instead checks,
    // at the individual-inspiration level, that appending the aromatherapy/
    // fragrance/scent/candle/diffuser alias group didn't shrink the
    // previously-passing relaxed-match set (relaxedThr for 1 primary token +
    // 1 alias group is ceil(2/2)=1, so this is a low but non-zero floor —
    // the meaningful assertion is "still > 0 and not silently dropped to 0",
    // which a naive hard-AND append design (primary.length balloons to 6)
    // would have caused).
    const { effectiveInsp } = scoreAllWithPhrases("小红书香薰产品种草图");
    expect(effectiveInsp).toBeGreaterThanOrEqual(6);
  });

  it("Amazon EBC enhanced brand content layout: the amazon long-scroll template clears the relaxed threshold via the ebc alias group", () => {
    const { primary, aliasGroups } = buildTokensWithPhrases("Amazon EBC enhanced brand content layout");
    expect(aliasGroups.some((g) => g.includes("enhanced brand content"))).toBe(true);
    const blob = buildTemplateBlob("template-amazon-long-scroll-product-infographic-template");
    const { hits } = scoreBlobWithAliases(blob, primary, aliasGroups);
    const relaxedThr = Math.ceil((primary.length + aliasGroups.length) / 2);
    // Not a strict/exact match (the template's own blob doesn't literally
    // say "ebc" or "content"), but the ebc alias group's "amazon" member
    // plus the literal "amazon"/"brand"/"layout" tokens clear the relaxed
    // threshold — this is the one genuinely relevant template surfacing in
    // the relaxed template pool where it previously did (see eval notes:
    // pre-fix this query had 11 incidentally-relaxed templates; post-fix
    // exactly 1, and it's this one).
    expect(hits).toBeGreaterThanOrEqual(relaxedThr);
  });
});
