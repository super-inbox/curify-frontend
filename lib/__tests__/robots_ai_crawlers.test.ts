import { describe, it, expect, vi } from "vitest";
import robots from "../../app/robots";

// robots.ts reads the request host to close the file on non-canonical hosts
// (the *.vercel.app deployment URLs). Default the mock to the canonical host
// so the existing policy assertions below exercise the real rule set.
let mockHost = "www.curify-ai.com";
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => (k === "host" ? mockHost : null) }),
}));

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

async function corpusRule() {
  const rules = (await robots()).rules;
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
  it("does not block the retrieval fetchers that produce citations", async () => {
    const blocked = await corpusRule();
    for (const ua of CITATION_FETCHERS) {
      expect(blocked, `${ua} must reach the prompt corpus — it cites us`).not.toContain(ua);
    }
  });

  it("still blocks the bulk training crawlers", async () => {
    const blocked = await corpusRule();
    for (const ua of TRAINING_CRAWLERS) {
      expect(blocked, `${ua} ingests without attributing`).toContain(ua);
    }
  });

  it("keeps GPTBot blocked while its search sibling stays allowed", async () => {
    // The pair most likely to be conflated: same vendor, opposite purpose.
    const blocked = await corpusRule();
    expect(blocked).toContain("GPTBot");
    expect(blocked).not.toContain("OAI-SearchBot");
    expect(blocked).not.toContain("ChatGPT-User");
  });

  it("leaves the wildcard rule allowing the site with only the known exclusions", async () => {
    const rules = (await robots()).rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const star = list.find((r) => r.userAgent === "*");
    expect(star).toBeDefined();
    expect(star!.allow).toBe("/");
    expect(star!.disallow).toEqual(["/api/", "/auth/", "/public/data/", "/search", "/*/search"]);
  });
});

/**
 * Guards the 2026-08-17 non-canonical-host close-off. Google discovered
 * /zh/tools/mockup via curify-frontend.vercel.app — URL Inspection named that
 * host as the referring URL. Every crawl there is a full dynamic render billed
 * as Fast Origin Transfer, for a copy that must never be indexed.
 */
describe("robots.ts — non-canonical hosts", () => {
  const withHost = async (host: string) => {
    const prev = mockHost;
    mockHost = host;
    try {
      return await robots();
    } finally {
      mockHost = prev;
    }
  };

  it("serves a fully closed robots.txt on the Vercel deployment host", async () => {
    const r = await withHost("curify-frontend.vercel.app");
    const list = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(list).toHaveLength(1);
    expect(list[0].userAgent).toBe("*");
    expect(list[0].disallow).toBe("/");
    expect(list[0].allow).toBeUndefined();
    // No sitemap/host on a copy we do not want crawled at all.
    expect(r.sitemap).toBeUndefined();
  });

  it("keeps the real policy on the canonical host and the apex it redirects from", async () => {
    for (const host of ["www.curify-ai.com", "curify-ai.com"]) {
      const r = await withHost(host);
      const list = Array.isArray(r.rules) ? r.rules : [r.rules];
      expect(list.length, `${host} must get the full rule set`).toBeGreaterThan(1);
      expect(r.sitemap).toBe("https://www.curify-ai.com/sitemap-index.xml");
    }
  });

  it("falls back to the real policy when no host header is present", async () => {
    // Build-time prerender has no request host; a closed file there would
    // ship a Disallow-all robots.txt to production.
    const r = await withHost("");
    const list = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(list.length).toBeGreaterThan(1);
  });
});
