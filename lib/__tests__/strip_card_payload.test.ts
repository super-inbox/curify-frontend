import { describe, it, expect } from "vitest";

import { nanoRegistry } from "@/lib/nano_utils";
import { buildOtherTemplateCards } from "@/lib/nano_page_data";
import nanoTemplates from "@/public/data/nano_templates.json";

// Runtime net under the `?: never` compile net in NanoTemplateStripCard.
//
// The sibling "other templates" rail crosses a CLIENT boundary, so every field
// on these cards is serialized into the page's RSC flight payload. Shipping the
// full feed card put 18 siblings' complete base_prompt (~27KB of hoisted Flight
// rows) plus their full descriptions into every /nano-template/* page — which
// is how a Chinese-vocabulary page carried the entire HSK prompt verbatim and
// outranked the actual HSK template for "hsk reading".
const ALLOWED = [
  "category",
  "id",
  "image_urls",
  "preview_image_urls",
  "template_id",
  "topics",
].sort();

const reg = nanoRegistry;
const identity = (k: string) => k;

describe("sibling strip cards carry no foreign template text", () => {
  const cards = buildOtherTemplateCards(reg, "en", identity, "template-mbti-nba", [
    "mbti",
    "character",
  ]);

  it("returns cards at all (guards a silently-empty projection)", () => {
    expect(cards.length).toBeGreaterThan(0);
  });

  it("exposes exactly the fields TemplateStrip renders", () => {
    for (const c of cards) {
      expect(Object.keys(c).sort(), c.template_id).toEqual(ALLOWED);
    }
  });

  it("serializes no base_prompt and no other template's description", () => {
    const json = JSON.stringify(cards);
    expect(json).not.toContain("base_prompt");
    expect(json).not.toContain("template_parameters");

    // Nothing in the payload may contain a sibling's authored prompt text.
    const prompts = (
      nanoTemplates as Array<{ id: string; locales?: Record<string, { base_prompt?: string }> }>
    )
      .map((t) => t.locales?.en?.base_prompt ?? t.locales?.zh?.base_prompt ?? "")
      .filter((p) => p.length > 80);
    expect(prompts.length).toBeGreaterThan(100); // the probe set is real
    for (const p of prompts) {
      expect(json.includes(p.slice(0, 80))).toBe(false);
    }
  });

  it("keeps one thumbnail per sibling, not the whole image list", () => {
    for (const c of cards) {
      expect(c.image_urls.length).toBeLessThanOrEqual(1);
      expect(c.preview_image_urls.length).toBeLessThanOrEqual(1);
    }
  });
});
