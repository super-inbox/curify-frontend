import { describe, expect, it } from "vitest";
import {
  buildSearchGenerationPlan,
  getBenchmarkGenerationPlan,
  retrieveCapabilityCandidates,
} from "../searchGenerationPlan";

describe("search generation planner", () => {
  it.each(["Fun Economics", " fun economics ", "FUN ECONOMICS"])(
    "returns the benchmark directions for %s",
    (query) => {
      const plan = getBenchmarkGenerationPlan(query);
      expect(plan?.source).toBe("benchmark");
      expect(plan?.total_credits).toBe(30);
      expect(plan?.directions).toEqual([
        expect.objectContaining({
          template_id:
            "template-weird-cold-knowledge-popular-science-card",
          params: { science_topic: "Fun Economics Facts" },
        }),
        expect.objectContaining({
          template_id: "template-education",
          params: { topic: "Basic Economics Concepts" },
        }),
        expect.objectContaining({
          template_id: "template-hotspot-card",
          params: { hotspot_name: "Inflation" },
        }),
      ]);
    },
  );

  it("retrieves valid capability candidates for a broad CJK query", () => {
    const matches = retrieveCapabilityCandidates("经济学知识卡片");
    expect(matches.length).toBeGreaterThan(0);
    expect(new Set(matches.map((match) => match.template_id)).size).toBe(
      matches.length,
    );
    expect(matches.every((match) => match.confidence >= 0.6)).toBe(true);
  });

  it("treats aesthetic wording as a modifier when retrieving a subject", () => {
    const matches = retrieveCapabilityCandidates("Reading aesthetics");
    expect(matches.map((match) => match.template_id)).toContain(
      "template-book-recommendation-grid-poster",
    );
  });

  it("uses sensible defaults for travel timing parameters", () => {
    const matches = retrieveCapabilityCandidates("remote destination");
    expect(matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          template_id: "template-travel",
          params: {
            destination: "remote destination",
            date_range: "Flexible dates",
          },
        }),
        expect.objectContaining({
          template_id: "template-series-travel",
          params: {
            destination_name: "remote destination",
            trip_duration: "7",
          },
        }),
      ]),
    );
  });

  it("maps Chinese aromatherapy wording to a direct-generation template", () => {
    const matches = retrieveCapabilityCandidates("香薰");
    expect(matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          template_id: "template-lifestyle-info-card",
          params: { topic: "香薰" },
        }),
      ]),
    );
  });

  it("normalizes the common Meet Gala misspelling for matching", async () => {
    const plan = await buildSearchGenerationPlan("meet gala", "en", {
      globalMatcher: async (query) => {
        expect(query).toBe("Met Gala");
        return [];
      },
      targetedReranker: async (query, candidateIds) => {
        expect(query).toBe("Met Gala");
        expect(candidateIds).toContain("template-lifestyle-photo-grid");
        return [
          {
            template_id: "template-lifestyle-photo-grid",
            params: { theme: "Met Gala red carpet" },
            confidence: 0.9,
            reason: "Met Gala red carpet photo grid",
          },
        ];
      },
    });
    expect(plan.directions).toEqual([
      expect.objectContaining({
        template_id: "template-lifestyle-photo-grid",
        params: { theme: "Met Gala red carpet" },
      }),
    ]);
  });

  it("does not substitute a text-only grid for an ID photo request", async () => {
    const plan = await buildSearchGenerationPlan("证件照", "zh", {
      globalMatcher: async () => {
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

  it("uses the targeted candidate reranker for ordinary queries", async () => {
    const plan = await buildSearchGenerationPlan("beginner astronomy", "en", {
      globalMatcher: async () => [
        {
          template_id: "template-education",
          params: { topic: "Beginner Astronomy" },
          confidence: 0.82,
          reason: "Educational concept map",
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
    expect(plan.source).toBe("hybrid");
    expect(plan.total_credits).toBe(10);
    expect(plan.directions).toEqual([
      expect.objectContaining({
        template_id: "template-education",
        params: { topic: "Beginner Astronomy" },
      }),
    ]);
  });

  it("falls back when the targeted reranker omits required params", async () => {
    const plan = await buildSearchGenerationPlan("classroom chemistry", "en", {
      globalMatcher: async () => [
        {
          template_id: "template-education",
          params: { topic: "Classroom Chemistry" },
          confidence: 0.84,
          reason: "Educational concept map",
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
        params: { topic: "Classroom Chemistry" },
      }),
    ]);
  });
});
