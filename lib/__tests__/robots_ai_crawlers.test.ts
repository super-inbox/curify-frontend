import { describe, it, expect } from "vitest";
import robots from "../../app/robots";

/**
 * Guards the training-vs-retrieval split made on 2026-08-09.
 *
 * AI referrals are our best-converting traffic (90d: chatgpt.com 79 visitors /
 * 70 actions, gemini 57/61, doubao 15/43, perplexity 12/15). The fetchers that
 * feed that — ChatGPT-User and PerplexityBot — cite the source with a link, so
 * they must reach the prompt corpus. Bulk training crawlers never attribute and
 * stay blocked. It would be easy to "tidy" these back into one list, so assert
 * the distinction.
 */
const CORPUS_PATHS = ["/*/nano-banana-pro-prompts/", "/*/nano-template/"];

/** Crawlers that fetch on demand and cite the source. Must NOT be blocked. */
const CITATION_FETCHERS = ["ChatGPT-User", "PerplexityBot", "OAI-SearchBot"];

/** Bulk ingest with no attribution path. Must stay blocked. */
const TRAINING_CRAWLERS = [
  "GPTBot",
  "CCBot",
  "cohere-ai",
  "anthropic-ai",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "ImagesiftBot",
  "Diffbot",
];

function corpusRule() {
  const rules = robots().rules;
  const list = Array.isArray(rules) ? rules : [rules];
  const rule = list.find((r) => {
    const d = r.disallow;
    const arr = Array.isArray(d) ? d : d ? [d] : [];
    return CORPUS_PATHS.every((p) => arr.includes(p));
  });
  if (!rule) throw new Error("no rule disallows the prompt-corpus paths");
  const ua = rule.userAgent;
  return Array.isArray(ua) ? ua : ua ? [ua] : [];
}

describe("robots.ts — AI crawler policy", () => {
  it("does not block the retrieval fetchers that produce citations", () => {
    const blocked = corpusRule();
    for (const ua of CITATION_FETCHERS) {
      expect(blocked, `${ua} must reach the prompt corpus — it cites us`).not.toContain(ua);
    }
  });

  it("still blocks the bulk training crawlers", () => {
    const blocked = corpusRule();
    for (const ua of TRAINING_CRAWLERS) {
      expect(blocked, `${ua} ingests without attributing`).toContain(ua);
    }
  });

  it("keeps GPTBot blocked while its search sibling stays allowed", () => {
    // The pair most likely to be conflated: same vendor, opposite purpose.
    const blocked = corpusRule();
    expect(blocked).toContain("GPTBot");
    expect(blocked).not.toContain("OAI-SearchBot");
    expect(blocked).not.toContain("ChatGPT-User");
  });

  it("leaves the wildcard rule allowing the site with only the known exclusions", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const star = list.find((r) => r.userAgent === "*");
    expect(star).toBeDefined();
    expect(star!.allow).toBe("/");
    expect(star!.disallow).toEqual(["/api/", "/auth/", "/public/data/", "/search", "/*/search"]);
  });
});
