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

// ─── Minimal tokenizer + scorer (mirrors eval_search.cjs) ────────────────────

const STOPWORDS = new Set([
  "the","a","an","of","in","on","is","are","and","or","to","for","with","by",
  "at","as","be","this","that","的","了","和","及",
  "topic","topics","theme","themes","category","categories",
  "insights","highlights","guide","guides",
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
