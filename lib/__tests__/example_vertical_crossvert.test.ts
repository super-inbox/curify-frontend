import { describe, it, expect } from "vitest";
import enNano from "@/messages/en/nano.json";
import { normalizeNanoLocaleMessageEntry, resolveExampleVerticalSections, type NanoMessagesDict } from "@/lib/nano_seo_utils";
function msgs(tid: string): NanoMessagesDict {
  return { [tid]: normalizeNanoLocaleMessageEntry((enNano as Record<string, unknown>)[tid]) };
}
describe("cross-vertical example enrichment", () => {
  it("chinese idiom → education schema + learning_objective", () => {
    const v = resolveExampleVerticalSections("template-chinese-idiom-learning-card","template-chinese-idiom-learning-card-hua-she-tian-zu",["language","vocabulary","flashcards"],msgs("template-chinese-idiom-learning-card"));
    expect(v?.schema.id).toBe("education");
    expect(v!.knowledge.map(k=>k.key)).toContain("learning_objective");
    expect(v!.attributes.find(a=>a.key==="subject")?.value).toBeTruthy();
  });
  it("WC sticker poster → merch schema + product_type", () => {
    const v = resolveExampleVerticalSections("template-world-cup-team-sticker-poster","template-world-cup-team-sticker-poster-portugal",["sports","stickers","posters"],msgs("template-world-cup-team-sticker-poster"));
    expect(v?.schema.id).toBe("merch");
    expect(v!.attributes.find(a=>a.key==="product_type")?.value).toBeTruthy();
    expect(v!.knowledge.map(k=>k.key)).toContain("manufacturing_notes");
  });
});
