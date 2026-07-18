import { describe, expect, it } from "vitest";
import type { SearchGenerationDirection } from "../searchGenerationPlan";
import { runSearchGenerationBatch } from "@/services/searchGenerationBatch";

const directions: SearchGenerationDirection[] = [
  {
    template_id: "template-weird-cold-knowledge-popular-science-card",
    title: "Facts",
    params: { science_topic: "Economics" },
    confidence: 1,
    reason: "facts",
  },
  {
    template_id: "template-education",
    title: "Concepts",
    params: { topic: "Economics" },
    confidence: 1,
    reason: "concepts",
  },
  {
    template_id: "template-hotspot-card",
    title: "Inflation",
    params: { hotspot_name: "Inflation" },
    confidence: 1,
    reason: "inflation",
  },
];

describe("search generation batch", () => {
  it("generates and polls one direction at a time", async () => {
    const events: string[] = [];
    const results = await runSearchGenerationBatch(
      directions,
      { locale: "en", batchId: "test", onUpdate: () => undefined },
      {
        start: async (request, locale) => {
          events.push(`start:${request.template_id}:${locale}`);
          return { success: true, project_id: request.template_id };
        },
        poll: async (projectId) => {
          events.push(`poll:${projectId}`);
          return `https://example.com/${projectId}.jpg`;
        },
      },
    );

    expect(events).toEqual([
      `start:${directions[0].template_id}:en`,
      `poll:${directions[0].template_id}`,
      `start:${directions[1].template_id}:en`,
      `poll:${directions[1].template_id}`,
      `start:${directions[2].template_id}:en`,
      `poll:${directions[2].template_id}`,
    ]);
    expect(results.every((item) => item.status === "completed")).toBe(true);
  });

  it("continues after an ordinary single-image failure", async () => {
    const started: string[] = [];
    const results = await runSearchGenerationBatch(
      directions,
      { locale: "zh", batchId: "test" },
      {
        start: async (request) => {
          started.push(request.template_id);
          if (request.template_id === "template-education") {
            throw new Error("content blocked");
          }
          return { success: true, signed_url: "https://example.com/result.jpg" };
        },
        poll: async () => "unused",
      },
    );

    expect(started).toHaveLength(3);
    expect(results.map((item) => item.status)).toEqual([
      "completed",
      "failed",
      "completed",
    ]);
  });

  it("stops remaining images after an insufficient-credit response", async () => {
    const started: string[] = [];
    const results = await runSearchGenerationBatch(
      directions,
      { locale: "en", batchId: "test" },
      {
        start: async (request) => {
          started.push(request.template_id);
          if (request.template_id === "template-education") {
            return { success: false, message: "Insufficient credits" };
          }
          return { success: true, signed_url: "https://example.com/result.jpg" };
        },
        poll: async () => "unused",
      },
    );

    expect(started).toHaveLength(2);
    expect(results.map((item) => item.status)).toEqual([
      "completed",
      "failed",
      "stopped",
    ]);
  });
});
