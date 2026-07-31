import { describe, it, expect } from "vitest";
import enNano from "@/messages/en/nano.json";
import {
  normalizeNanoLocaleMessageEntry,
  resolveExampleVerticalSections,
  type NanoMessagesDict,
} from "@/lib/nano_seo_utils";

// Build the same nanoMessages shape the page does (normalized single entry).
function messagesFor(templateId: string): NanoMessagesDict {
  const raw = (enNano as Record<string, unknown>)[templateId];
  return { [templateId]: normalizeNanoLocaleMessageEntry(raw) };
}
const MBTI_TOPICS = ["mbti"];

describe("example-level vertical resolution (MBTI batch)", () => {
  it("Naruto example resolves ENFP chips + knowledge", () => {
    const v = resolveExampleVerticalSections(
      "template-mbti-generic",
      "template-mbti-generic-naruto-narutouzumaki",
      MBTI_TOPICS,
      messagesFor("template-mbti-generic")
    );
    expect(v).not.toBeNull();
    expect(v!.schema.id).toBe("mbti");
    expect(v!.attributes.find((a) => a.key === "type_code")?.value).toBe("ENFP");
    // knowledge slots authored
    const keys = v!.knowledge.map((k) => k.key);
    expect(keys).toEqual(expect.arrayContaining(["traits", "strengths", "career", "compatibility"]));
  });

  it("normalizer passes content.examples through", () => {
    const m = normalizeNanoLocaleMessageEntry((enNano as any)["template-mbti-nba"]);
    expect(m.content?.examples?.["template-mbti-nba-erling-haaland"]?.attributes?.type_code).toBe("ISTP");
  });

  it("an un-enriched example of the same template returns null", () => {
    const v = resolveExampleVerticalSections(
      "template-mbti-nba",
      "template-mbti-nba-some-unenriched-player",
      MBTI_TOPICS,
      messagesFor("template-mbti-nba")
    );
    expect(v).toBeNull();
  });

  it("all 6 batch examples resolve a type_code", () => {
    const batch: [string, string][] = [
      ["template-mbti-nba", "template-mbti-nba-erling-haaland"],
      ["template-mbti-nba", "template-mbti-nba-jude"],
      ["template-mbti-nba", "template-mbti-nba-lamine-yamal"],
      ["template-mbti-generic", "template-mbti-generic-naruto-narutouzumaki"],
      ["template-mbti-yellowstone", "template-mbti-yellowstone-johndutton"],
      ["template-friends-character-mbti", "template-friends-character-mbti-joey-tribbiani"],
    ];
    for (const [tid, eid] of batch) {
      const v = resolveExampleVerticalSections(tid, eid, MBTI_TOPICS, messagesFor(tid));
      expect(v?.attributes.find((a) => a.key === "type_code")?.value, eid).toBeTruthy();
    }
  });
});
