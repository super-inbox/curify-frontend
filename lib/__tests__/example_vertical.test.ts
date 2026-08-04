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

  it("GSC-led batch (marta/founder/liu-bei) resolve their card-grounded type_code", () => {
    const cases: [string, string, string][] = [
      ["template-mbti-nba", "template-mbti-nba-marta", "ESFP"],
      ["template-mbti-nba", "template-mbti-nba-derrickrose", "ENFP"],
      ["template-mbti-siliconvalley", "template-mbti-siliconvalley-founder", "ENTJ"],
      ["template-chinese-classic-character-mbti", "template-chinese-classic-character-mbti-liu-bei", "INFJ"],
      ["template-chinese-classic-character-mbti", "template-chinese-classic-character-mbti-miaoyu", "INTJ"],
    ];
    for (const [tid, eid, code] of cases) {
      const v = resolveExampleVerticalSections(tid, eid, MBTI_TOPICS, messagesFor(tid));
      expect(v?.attributes.find((a) => a.key === "type_code")?.value, eid).toBe(code);
    }
  });
});

describe("education example-level resolution + no template-prose leak", () => {
  const EDU = ["education", "learning", "language"];

  it("enriched education example carries its own learning objective prose", () => {
    const v = resolveExampleVerticalSections(
      "template-science-education-infographic",
      "template-science-education-infographic-ocean-zones",
      EDU,
      messagesFor("template-science-education-infographic")
    );
    expect(v?.schema.id).toBe("education");
    const lo = v?.knowledge.find((k) => k.key === "learning_objective")?.text ?? "";
    expect(lo.toLowerCase()).toContain("ocean");
  });

  it("un-enriched example of a template WITH template-level prose shows chips but NO leaked prose", () => {
    // template-english-confusing-word-pair has template-level attributes + vertical prose.
    // An example that carries no vertical of its own must NOT inherit that prose.
    const v = resolveExampleVerticalSections(
      "template-english-confusing-word-pair-educational-poster",
      "template-english-confusing-word-pair-educational-poster-nonexistent-example",
      EDU,
      messagesFor("template-english-confusing-word-pair-educational-poster")
    );
    // chips still inherit from the template…
    expect((v?.attributes.length ?? 0)).toBeGreaterThan(0);
    // …but authored prose does not leak onto the example page.
    expect(v?.knowledge ?? []).toEqual([]);
  });
});
