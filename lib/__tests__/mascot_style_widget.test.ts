import { describe, it, expect } from "vitest";
import { mascotPromptSuffix, MASCOT_STYLE_PRESETS, MASCOT_LAYOUT_PRESETS } from "@/app/[locale]/_components/MascotStyleLayoutWidget";

describe("mascot style/layout prompt suffix", () => {
  it("defaults (first preset of each) produce an EMPTY suffix — current template output", () => {
    expect(mascotPromptSuffix(MASCOT_STYLE_PRESETS[0].key, MASCOT_LAYOUT_PRESETS[0].key)).toBe("");
  });
  it("non-default style only", () => {
    expect(mascotPromptSuffix("3d", MASCOT_LAYOUT_PRESETS[0].key)).toContain("3D");
    expect(mascotPromptSuffix("3d", MASCOT_LAYOUT_PRESETS[0].key)).not.toContain("Arrange");
  });
  it("non-default style + layout combine", () => {
    const s = mascotPromptSuffix("clay", "stickers");
    expect(s).toContain("clay");
    expect(s).toContain("sticker sheet");
  });
  it("every preset key is unique", () => {
    const keys = [...MASCOT_STYLE_PRESETS, ...MASCOT_LAYOUT_PRESETS].map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
