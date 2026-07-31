import { describe, it, expect } from "vitest";
import { ALL_SUGGESTIONS, filterSuggestions } from "@/lib/searchIndex";

// Mirrors the search page's topic-redirect resolver (page.tsx ~line 457):
// exact match on slug | label | alias | localized.
function resolveTopic(query: string) {
  const q = query.toLowerCase().trim();
  return ALL_SUGGESTIONS.find(
    (s) =>
      s.slug === q ||
      s.label.toLowerCase() === q ||
      (s.aliases ?? []).some((a) => a.toLowerCase() === q)
  );
}

describe("branding topic resolves brand queries", () => {
  for (const q of ["brand design", "brand identity", "logo design", "visual identity", "brand guidelines", "品牌设计"]) {
    it(`"${q}" → /topics/branding`, () => {
      const t = resolveTopic(q);
      expect(t?.slug).toBe("branding");
    });
  }
  it("dropdown surfaces Brand & Identity for 'brand design'", () => {
    expect(filterSuggestions("brand design", 8).map((s) => s.slug)).toContain("branding");
  });
  it("does not hijack an unrelated design query", () => {
    // 'poster design' should NOT resolve to branding (no exact alias)
    expect(resolveTopic("poster design")?.slug).not.toBe("branding");
  });
});
