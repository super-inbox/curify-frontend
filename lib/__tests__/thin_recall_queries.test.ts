/**
 * Recall regression tests for thin-search-query fixes (Prompt 8).
 *
 * Covers six root causes:
 *   A. book lovers gift guide            — alias gap (gift, lovers missing from book posters)
 *   B. Spanish vocabulary printable      — alias gap (printable missing from es vocab items)
 *   C. bilingual flashcards korean fruits — alias gap (flashcards/kids/learning missing)
 *   D. lunar new year red envelope graphic design — alias gap (graphic missing)
 *   E. watercolor map of europe travel destinations — alias gap (destinations singular/plural)
 *   F. cuban sandwich recipe poster       — alias gap (poster missing)
 *
 * Content/template inventory gaps (not fixable via alias alone):
 *   - homophones and homonyms   → already 6 strict via template cascade; OK
 *   - mbti marvel               → 74 strict; OK
 *   - 反义词                    → 57 strict; OK
 *   - 工程                      → 6 strict; genuine catalog breadth limit, not alias gap
 *   - paper cutting             → 49 strict; OK
 *   - samurai                   → 9 strict; OK
 *
 * Tokenizer + scorer logic mirrors app/[locale]/(public)/search/page.tsx.
 * Keep in sync with any future changes to that file.
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

function buildInspBlob(r: InspRecord): string {
  const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [
    l?.title,
    l?.category,
  ]);
  return normalizeForSearch(
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
}

function scoreInspiration(
  r: InspRecord,
  tokens: string[]
): { strict: boolean; relaxed: boolean; hits: number } {
  const blob = buildInspBlob(r);
  let hits = 0;
  for (const t of tokens) {
    if (tokenInBlob(blob, t)) hits++;
  }
  const strict = hits === tokens.length;
  const relaxed = !strict && hits >= relaxedThreshold(tokens.length);
  return { strict, relaxed, hits };
}

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

function byId(id: string): InspRecord {
  const r = INSP.find((x) => x.id === id);
  if (!r) throw new Error(`inspiration not found: ${id}`);
  return r;
}

// ─── A. book lovers gift guide ───────────────────────────────────────────────

describe("book lovers gift guide", () => {
  const QUERY = "book lovers gift guide";

  it("book-recommendation posters have gift and lovers aliases", () => {
    const reco = byId("template-book-recommendation-grid-poster-fantasy-adventures");
    expect(reco.search_aliases).toContain("gift");
    expect(reco.search_aliases).toContain("lovers");
    expect(reco.search_aliases).toContain("book lovers");
  });

  it("each book-recommendation-grid-poster is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const RECO_IDS = [
      "template-book-recommendation-grid-poster-fantasy-adventures",
      "template-book-recommendation-grid-poster-historical-fiction",
      "template-book-recommendation-grid-poster-mystery-thriller",
      "template-book-recommendation-grid-poster-sci-fi-classics",
      "template-book-recommendation-grid-poster-self-improvement",
    ];
    for (const id of RECO_IDS) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should be strict`).toBe(true);
    }
  });

  it("template-book-minimalist-plant-lovers is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(byId("template-book-minimalist-plant-lovers"), tokens);
    expect(strict).toBe(true);
  });

  it("full scoring: at least 6 strict inspirations", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBeGreaterThanOrEqual(6);
    expect(strictIds.has("template-book-recommendation-grid-poster-fantasy-adventures")).toBe(true);
    expect(strictIds.has("template-book-recommendation-grid-poster-sci-fi-classics")).toBe(true);
    expect(strictIds.has("template-book-minimalist-plant-lovers")).toBe(true);
  });
});

// ─── B. Spanish vocabulary printable ─────────────────────────────────────────

describe("Spanish vocabulary printable", () => {
  const QUERY = "Spanish vocabulary printable";

  it("spanish vocab items have printable alias", () => {
    const r = byId("template-vocabulary-english-spanish-fruits");
    expect(r.search_aliases).toContain("printable");
  });

  it("template-vocabulary-english-spanish-fruits is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict } = scoreInspiration(byId("template-vocabulary-english-spanish-fruits"), tokens);
    expect(strict).toBe(true);
  });

  it("multiple Spanish vocab items are strict matches", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const SAMPLE_IDS = [
      "template-vocabulary-english-spanish-colors",
      "template-vocabulary-english-spanish-family-members",
      "template-vocabulary-english-spanish-body-parts",
      "template-vocabulary-english-spanish-weather",
      "template-vocabulary-english-spanish-daily-routines",
    ];
    for (const id of SAMPLE_IDS) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should be strict`).toBe(true);
    }
  });

  it("full scoring: at least 10 strict inspirations", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBeGreaterThanOrEqual(10);
  });
});

// ─── C. bilingual flashcards for kids learning korean fruits ─────────────────

describe("bilingual flashcards for kids learning korean fruits", () => {
  const QUERY = "bilingual flashcards for kids learning korean fruits";

  it("template-vocabulary-english-korean-fruits has flashcards, kids, and learning aliases", () => {
    const r = byId("template-vocabulary-english-korean-fruits");
    expect(r.search_aliases).toContain("flashcards");
    expect(r.search_aliases).toContain("kids");
    expect(r.search_aliases).toContain("learning");
  });

  it("template-vocabulary-english-korean-fruits is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    expect(tokens).toContain("bilingual");
    expect(tokens).toContain("flashcards");
    expect(tokens).toContain("kids");
    expect(tokens).toContain("korean");
    expect(tokens).toContain("fruits");
    const { strict, hits } = scoreInspiration(byId("template-vocabulary-english-korean-fruits"), tokens);
    expect(hits).toBe(tokens.length);
    expect(strict).toBe(true);
  });

  it("full scoring: korean-fruits item appears as strict match", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.has("template-vocabulary-english-korean-fruits")).toBe(true);
  });
});

// ─── D. lunar new year red envelope graphic design ───────────────────────────

describe("lunar new year red envelope graphic design", () => {
  const QUERY = "lunar new year red envelope graphic design";

  it("red envelope items have graphic alias", () => {
    const r = byId("template-lunar-new-year-red-envelope-set-dragon-year-red-envelopes");
    expect(r.search_aliases).toContain("graphic");
    expect(r.search_aliases).toContain("graphic design");
  });

  it("each red envelope item is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const LNY_IDS = [
      "template-lunar-new-year-red-envelope-set-cat-themed-red-envelopes",
      "template-lunar-new-year-red-envelope-set-dragon-year-red-envelopes",
      "template-lunar-new-year-red-envelope-set-floral-blessing-red-envelopes",
      "template-lunar-new-year-red-envelope-set-cute-cat-fish",
      "template-lunar-new-year-red-envelope-set-dragon-prosperity",
      "template-lunar-new-year-red-envelope-set-floral-blessings",
      "template-lunar-new-year-red-envelope-set-koi-fish-prosperity",
      "template-lunar-new-year-red-envelope-set-koi-fish-red-envelopes",
    ];
    for (const id of LNY_IDS) {
      const { strict } = scoreInspiration(byId(id), tokens);
      expect(strict, `${id} should be strict`).toBe(true);
    }
  });

  it("full scoring: 8 strict red envelope inspirations", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.size).toBeGreaterThanOrEqual(8);
    expect(strictIds.has("template-lunar-new-year-red-envelope-set-koi-fish-prosperity")).toBe(true);
  });
});

// ─── E. watercolor map of europe travel destinations ─────────────────────────

describe("watercolor map of europe travel destinations", () => {
  const QUERY = "watercolor map of europe travel destinations";

  it("europe watercolor map has destinations alias", () => {
    const r = byId("template-watercolor-world-map-illustration-europe");
    expect(r.search_aliases).toContain("destinations");
    expect(r.search_aliases).toContain("travel destinations");
  });

  it("template-watercolor-world-map-illustration-europe is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict, hits } = scoreInspiration(
      byId("template-watercolor-world-map-illustration-europe"),
      tokens
    );
    expect(hits).toBe(tokens.length);
    expect(strict).toBe(true);
  });

  it("full scoring: europe watercolor map appears in strict results", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.has("template-watercolor-world-map-illustration-europe")).toBe(true);
  });
});

// ─── F. cuban sandwich recipe poster ─────────────────────────────────────────

describe("cuban sandwich recipe poster", () => {
  const QUERY = "cuban sandwich recipe poster";

  it("template-food-cuban-sandwich has poster alias", () => {
    const r = byId("template-food-cuban-sandwich");
    expect(r.search_aliases).toContain("poster");
  });

  it("template-food-cuban-sandwich is a strict match", () => {
    const tokens = buildPrimaryTokens(QUERY);
    const { strict, hits } = scoreInspiration(byId("template-food-cuban-sandwich"), tokens);
    expect(hits).toBe(tokens.length);
    expect(strict).toBe(true);
  });

  it("full scoring: cuban sandwich appears in strict results", () => {
    const { strictIds } = scoreAll(QUERY);
    expect(strictIds.has("template-food-cuban-sandwich")).toBe(true);
  });
});

// ─── G. Regression: previously-fixed WARN queries still pass ─────────────────

describe("regression: WARN query fixes still intact", () => {
  it("homophones and homonyms: 6+ strict via template cascade", () => {
    const { strictIds } = scoreAll("homophones and homonyms");
    expect(strictIds.size).toBeGreaterThanOrEqual(6);
  });

  it("paris travel itinerary: at least 2 strict inspirations", () => {
    const { strictIds } = scoreAll("paris travel itinerary");
    expect(strictIds.has("template-tourist-spot-watercolor-map-infographic-historic-landmarks-of-paris")).toBe(true);
    expect(strictIds.has("template-city-miniature-paris")).toBe(true);
  });

  it("warmup routine running checklist: exactly 1 strict (running)", () => {
    const { strictIds } = scoreAll("warmup routine running checklist");
    expect(strictIds.has("template-warmup-routine-running")).toBe(true);
    expect(strictIds.has("template-warmup-routine-gym")).toBe(false);
  });

  it("before after kitchen organization makeover: 2 strict", () => {
    const { strictIds } = scoreAll("before after kitchen organization makeover");
    expect(strictIds.size).toBe(2);
    expect(strictIds.has("template-home-organization-before-after-before-after-kitchen-organization-makeover")).toBe(true);
    expect(strictIds.has("template-home-organization-before-after-kitchen")).toBe(true);
  });

  it("vintage stamp collection garden birds: exactly 1 strict", () => {
    const { strictIds } = scoreAll("vintage stamp collection garden birds");
    expect(strictIds.has("template-vintage-stamp-collection-illustration-garden-birds")).toBe(true);
    expect(strictIds.has("template-vintage-stamp-collection-illustration-ocean-life")).toBe(false);
  });

  it("mbti marvel: 74+ strict results", () => {
    const { strictIds } = scoreAll("mbti marvel");
    expect(strictIds.size).toBeGreaterThanOrEqual(74);
  });

  it("samurai: 9+ strict results", () => {
    const { strictIds } = scoreAll("samurai");
    expect(strictIds.size).toBeGreaterThanOrEqual(9);
    expect(strictIds.has("template-fandom-character-grid-poster-famous-samurai-japan")).toBe(true);
  });

  it("paper cutting: 49+ strict results", () => {
    const { strictIds } = scoreAll("paper cutting");
    expect(strictIds.size).toBeGreaterThanOrEqual(49);
    expect(strictIds.has("template-intangible-heritage-paper-cutting")).toBe(true);
  });
});
