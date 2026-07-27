import { describe, expect, it } from "vitest";
import {
  buildSemanticRetrievalRoutes,
  rankMultiRouteCandidates,
  type EmbeddedTemplate,
  type SearchIntent,
} from "../searchTemplateRetrieval";

describe("multi-route template retrieval", () => {
  it("keeps the original query and independent intent routes", () => {
    const intent: SearchIntent = {
      subject: "economics",
      goal: "explain",
      tone: ["fun"],
      routes: [
        { kind: "subject", query: "economics education" },
        { kind: "goal", query: "explain economics concepts visually" },
        { kind: "style_format", query: "playful approachable economics visual" },
      ],
    };

    expect(buildSemanticRetrievalRoutes("fun economics", intent)).toEqual([
      { kind: "original", query: "fun economics" },
      { kind: "subject", query: "economics education" },
      { kind: "goal", query: "explain economics concepts visually" },
      {
        kind: "style_format",
        query: "playful approachable economics visual",
      },
    ]);
  });

  it("expands duplicate LLM routes from structured intent fields", () => {
    const intent: SearchIntent = {
      subject: "economics",
      goal: "explain",
      tone: ["fun"],
      routes: [
        { kind: "subject", query: "fun economics" },
        { kind: "goal", query: "fun economics" },
        { kind: "style_format", query: "fun economics" },
      ],
    };

    expect(buildSemanticRetrievalRoutes("fun economics", intent)).toEqual([
      { kind: "original", query: "fun economics" },
      { kind: "subject", query: "economics" },
      {
        kind: "goal",
        query: "economics; goal: explain; visual content",
      },
      { kind: "style_format", query: "economics; tone: fun" },
    ]);
  });

  it("merges candidates from separate routes and rewards route coverage", () => {
    const templates: EmbeddedTemplate[] = [
      {
        template_id: "template-finance",
        text: "finance",
        embedding: [1, 0],
      },
      {
        template_id: "template-playful",
        text: "playful education",
        embedding: [0.8, 0.6],
      },
      {
        template_id: "template-unrelated",
        text: "unrelated",
        embedding: [0, 1],
      },
    ];
    const routes = [
      { kind: "original" as const, query: "fun economics" },
      { kind: "goal" as const, query: "economics education" },
    ];

    const candidates = rankMultiRouteCandidates(templates, routes, [
      [1, 0],
      [0.8, 0.6],
    ]);

    expect(candidates.map((candidate) => candidate.template_id)).toEqual(
      expect.arrayContaining(["template-finance", "template-playful"]),
    );
    expect(
      candidates.find(
        (candidate) => candidate.template_id === "template-finance",
      )?.matched_routes,
    ).toEqual(["original", "goal"]);
  });
});
