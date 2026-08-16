import { describe, expect, it } from "vitest";
import { buildSearchGenerationPlan } from "../searchGenerationPlan";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";

describe("search generation planner", () => {
  it.each(["fun economics", "funny economics", "趣味经济学"])(
    "routes an evaluation query through the regular similarity planner: %s",
    async (query) => {
      const plan = await buildSearchGenerationPlan(query, "en", {
        candidateRetriever: async (receivedQuery) => {
          expect(receivedQuery).toBe(query);
          return [
            {
              template_id: "template-education",
            },
          ];
        },
        targetedReranker: async (receivedQuery, candidateIds) => {
          expect(receivedQuery).toBe(query);
          expect(candidateIds).toContain("template-education");
          return [
            {
              template_id: "template-education",
              params: { topic: query },
              confidence: 0.9,
              reason: "Semantic similarity match",
            },
          ];
        },
      });

      expect(plan.source).toBe("similarity");
      expect(plan.directions).toEqual([
        expect.objectContaining({
          template_id: "template-education",
          params: { topic: query },
        }),
      ]);
    },
  );

  it("uses the targeted candidate reranker for ordinary queries", async () => {
    const plan = await buildSearchGenerationPlan("beginner astronomy", "en", {
      candidateRetriever: async () => [
        {
          template_id: "template-education",
        },
      ],
      targetedReranker: async (_query, candidateIds) => {
        expect(candidateIds).toContain("template-education");
        return [
          {
            template_id: "template-education",
            params: { topic: "Beginner Astronomy" },
            confidence: 0.91,
            reason: "Educational concept map",
          },
        ];
      },
    });
    expect(plan.source).toBe("similarity");
    expect(plan.total_credits).toBe(
      plan.directions.length * IMAGE_GENERATION_CREDITS,
    );
    expect(plan.directions).toEqual([
      expect.objectContaining({
        template_id: "template-education",
        params: { topic: "Beginner Astronomy" },
      }),
    ]);
  });

  it("uses the generic fallback when the reranker omits required params", async () => {
    const plan = await buildSearchGenerationPlan("classroom chemistry", "en", {
      candidateRetriever: async () => [
        {
          template_id: "template-education",
        },
      ],
      targetedReranker: async () => [
        {
          template_id: "template-education",
          params: {},
          confidence: 0.95,
          reason: "Missing the required topic",
        },
      ],
    });
    expect(plan.directions).toEqual([
      expect.objectContaining({
        template_id: "template-education",
        params: { topic: "classroom chemistry" },
      }),
    ]);
  });

  it("uses a general visual explainer when no specialized template matches", async () => {
    const plan = await buildSearchGenerationPlan(
      "unmatched niche concept",
      "en",
      {
        candidateRetriever: async () => [],
        targetedReranker: async () => [],
      },
    );

    expect(plan.source).toBe("fallback");
    expect(plan.total_credits).toBe(
      plan.directions.length * IMAGE_GENERATION_CREDITS,
    );
    expect(plan.directions).toEqual([
      expect.objectContaining({
        template_id: "template-education",
        params: { topic: "unmatched niche concept" },
      }),
    ]);
  });

  it("explains when a query requires a reference portrait", async () => {
    const plan = await buildSearchGenerationPlan("证件照", "zh", {
      candidateRetriever: async () => {
        throw new Error("matcher should not run");
      },
      targetedReranker: async () => {
        throw new Error("reranker should not run");
      },
    });

    expect(plan.directions).toEqual([]);
    expect(plan.total_credits).toBe(0);
    expect(plan.notice).toContain("上传本人照片");
  });
});
