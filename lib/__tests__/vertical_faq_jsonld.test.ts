import { describe, it, expect } from "vitest";
import { buildVerticalFaqJsonLd, mbtiSubjectFromTitle } from "../nano_seo_utils";
import type { ResolvedVerticalPage } from "../nano_seo_utils";

const mbti = (
  attributes: { key: string; value: string }[],
  knowledge: { key: string; text: string }[]
): ResolvedVerticalPage =>
  ({
    schema: { id: "mbti", schemaOrgType: "Article" },
    attributes: attributes.map((a) => ({ ...a, label: a.key, facet: false })),
    knowledge: knowledge.map((k) => ({ ...k, label: k.key })),
  }) as unknown as ResolvedVerticalPage;

describe("mbtiSubjectFromTitle", () => {
  it("strips the SEO tail off real page titles", () => {
    expect(mbtiSubjectFromTitle("Erling Haaland — ISTP Goal Scorer MBTI Football Card"))
      .toBe("Erling Haaland");
    expect(mbtiSubjectFromTitle("Jude Bellingham — ENTJ Football Card | MBTI Sports Insights"))
      .toBe("Jude Bellingham");
  });

  it("handles localized titles and CJK separators", () => {
    expect(mbtiSubjectFromTitle("Joey Tribbiani — ENFP 미식가 MBTI 포스터 | Friends 캐릭터 가이드"))
      .toBe("Joey Tribbiani");
    expect(mbtiSubjectFromTitle("Наруто Узумаки — визуализация персонажа MBTI ENFP"))
      .toBe("Наруто Узумаки");
    expect(mbtiSubjectFromTitle("孙雯｜ISTJ 足球卡")).toBe("孙雯");
  });

  it("returns empty for degenerate input so the FAQ block is suppressed", () => {
    for (const t of ["", null, undefined, "— ISTP", "ISTP"]) {
      expect(mbtiSubjectFromTitle(t as string | null | undefined), String(t)).toBe("");
    }
  });
});

describe("buildVerticalFaqJsonLd", () => {
  const title = "Erling Haaland — ISTP Goal Scorer MBTI Football Card";

  it("leads with the question the bleeding traffic actually searches", () => {
    const out = buildVerticalFaqJsonLd(
      mbti([{ key: "type_code", value: "ISTP" }, { key: "type_nickname", value: "The Virtuoso" }], []),
      { name: title }
    )!;
    expect(out["@type"]).toBe("FAQPage");
    const first = (out.mainEntity as Record<string, unknown>[])[0];
    expect(first.name).toBe("What is Erling Haaland's MBTI type?");
    expect((first.acceptedAnswer as Record<string, string>).text)
      .toBe("Erling Haaland is typed as ISTP — The Virtuoso.");
  });

  it("turns each authored knowledge slot into a real question", () => {
    const out = buildVerticalFaqJsonLd(
      mbti([{ key: "type_code", value: "ISTP" }], [
        { key: "strengths", text: "Composure under pressure." },
        { key: "career", text: "Roles rewarding independent execution." },
      ]),
      { name: title }
    )!;
    const qs = (out.mainEntity as Record<string, unknown>[]).map((e) => e.name);
    expect(qs).toContain("What are Erling Haaland's strengths?");
    expect(qs).toContain("What careers suit Erling Haaland's personality type?");
    // Every entry must be an actual question — Google rejects headings.
    for (const q of qs) expect(String(q).endsWith("?"), String(q)).toBe(true);
  });

  it("never emits an empty FAQPage (that is a structured-data error)", () => {
    expect(buildVerticalFaqJsonLd(mbti([], []), { name: title })).toBeNull();
    expect(buildVerticalFaqJsonLd(mbti([], [{ key: "strengths", text: "   " }]), { name: title }))
      .toBeNull();
    expect(buildVerticalFaqJsonLd(null, { name: title })).toBeNull();
  });

  it("only applies to the mbti vertical", () => {
    const merch = { ...mbti([{ key: "type_code", value: "ISTP" }], []) };
    (merch.schema as { id: string }).id = "merch";
    expect(buildVerticalFaqJsonLd(merch, { name: title })).toBeNull();
  });

  it("skips knowledge slots with no question mapping", () => {
    const out = buildVerticalFaqJsonLd(
      mbti([{ key: "type_code", value: "ISTP" }], [{ key: "unmapped_slot", text: "text" }]),
      { name: title }
    )!;
    expect((out.mainEntity as unknown[]).length).toBe(1);
  });
});
