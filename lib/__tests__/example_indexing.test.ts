import { describe, it, expect } from "vitest";
import { templateExamplesIndexable } from "@/lib/example_indexing";
import nanoTemplates from "@/public/data/nano_templates.json";

const topicsOf = (id: string) =>
  (nanoTemplates as Array<{ id: string; topics?: string[] }>).find((t) => t.id === id)?.topics ?? [];

describe("example indexing classifier (topic-derived)", () => {
  it("info-heavy templates → index examples", () => {
    for (const id of [
      "template-mbti-nba", "template-mbti-generic", "template-zhenhuan-mbti-character-analysis",
      "template-chinese-idiom-learning-card", "template-solar-term",
    ]) expect(templateExamplesIndexable(topicsOf(id)), id).toBe(true);
  });
  it("generator-demo templates → noindex examples", () => {
    for (const id of [
      "template-ip-character-expression-sheet", "template-original-character-sticker-pack",
      "template-ip-creative-cultural-goods-mockup-set", "template-perfume-cosmetic-bottle-mockup",
      "template-brand-ip-mascot-design-board",
    ]) expect(templateExamplesIndexable(topicsOf(id)), id).toBe(false);
  });
  it("explicit override wins over topics", () => {
    expect(templateExamplesIndexable(["design", "mockups"], true)).toBe(true);   // force index
    expect(templateExamplesIndexable(["mbti"], false)).toBe(false);              // force noindex
  });
  it("image-input tools → noindex examples, even on a content topic", () => {
    // `guides` / `comparison` are broad enough to drag genuine TOOLS into the
    // info-heavy bucket. portrait-retouching-blueprint reached position 35 on
    // an example titled "en 3" while its own template sat at 60.
    for (const id of [
      "template-portrait-retouching-blueprint",       // via `guides`
      "template-soft-decoration-design-guide",        // via `guides`
      "template-home-organization-before-after",      // via `comparison`
      "template-fashion-before-after-outfit-annotation-card", // via `comparison`, `study-sheets`
    ]) {
      expect(templateExamplesIndexable(topicsOf(id)), `${id} topics-only`).toBe(true);
      expect(templateExamplesIndexable(topicsOf(id), undefined, true), id).toBe(false);
    }
  });
  it("explicit override still beats the image-input signal", () => {
    expect(templateExamplesIndexable(["mbti"], true, true)).toBe(true);
  });
  it("mbti-nba (requires upload but info-heavy) stays indexed", () => {
    // guards the regression where deriving from requires_image_upload would have
    // noindex'd the highest-impression pages.
    expect(templateExamplesIndexable(topicsOf("template-mbti-nba"))).toBe(true);
  });
});
