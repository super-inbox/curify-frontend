import { describe, it, expect } from "vitest";
import { isBlockedBot, isCorpusPath } from "../blocked-bots";

/**
 * Guards the GEO surface against the edge blocklist.
 *
 * AI referrals are our best-converting traffic (90d: chatgpt.com 79 visitors /
 * 70 actions, gemini 57/61, doubao 15/43, perplexity 12/15 — versus
 * m.facebook.com's 1,557 visitors at ~0 actions). isBlockedBot() matches on
 * SUBSTRINGS, so adding a token like "claude" or "gpt" would silently take out
 * a citation fetcher and no test would fail. Assert the distinction directly.
 */
const CITATION_FETCHERS: Array<[string, string]> = [
  ["OAI-SearchBot", "Mozilla/5.0 compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot"],
  ["ChatGPT-User", "Mozilla/5.0 ChatGPT-User/1.0; +https://openai.com/bot"],
  ["PerplexityBot", "Mozilla/5.0 PerplexityBot/1.0; +https://perplexity.ai/perplexitybot"],
  ["Perplexity-User", "Mozilla/5.0 Perplexity-User/1.0"],
  ["Claude-User", "Mozilla/5.0 Claude-User/1.0; +Claude-User@anthropic.com"],
  ["Claude-SearchBot", "Mozilla/5.0 Claude-SearchBot/1.0"],
  ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
  ["Google-Extended", "Mozilla/5.0 (compatible; Google-Extended/1.0)"],
  ["Bingbot", "Mozilla/5.0 (compatible; bingbot/2.0)"],
  ["Applebot", "Mozilla/5.0 (compatible; Applebot/0.1)"],
  ["DuckAssistBot", "Mozilla/5.0 (compatible; DuckAssistBot/1.0)"],
  ["Bytespider", "Mozilla/5.0 (compatible; Bytespider)"], // ByteDance -> Doubao
];

const TRAINING_CRAWLERS: Array<[string, string]> = [
  ["GPTBot", "Mozilla/5.0 (compatible; GPTBot/1.2)"],
  ["CCBot", "CCBot/2.0 (https://commoncrawl.org/faq/)"],
  ["meta-externalagent", "Mozilla/5.0 (compatible; meta-externalagent/1.1)"],
  ["ClaudeBot", "Mozilla/5.0 (compatible; ClaudeBot/1.0)"],
  ["anthropic-ai", "anthropic-ai"],
];

describe("blocked-bots — GEO safety", () => {
  it("never blocks a retrieval/citation fetcher", () => {
    for (const [name, ua] of CITATION_FETCHERS) {
      expect(isBlockedBot(ua), `${name} cites us — blocking it costs referrals`).toBe(false);
    }
  });

  it("still blocks the bulk training crawlers", () => {
    for (const [name, ua] of TRAINING_CRAWLERS) {
      expect(isBlockedBot(ua), `${name} ingests without attributing`).toBe(true);
    }
  });

  it("keeps the same-vendor pairs apart", () => {
    // The pairs most likely to be conflated by a future edit.
    expect(isBlockedBot("GPTBot/1.2")).toBe(true);
    expect(isBlockedBot("OAI-SearchBot/1.4")).toBe(false);
    expect(isBlockedBot("ClaudeBot/1.0")).toBe(true);
    expect(isBlockedBot("Claude-User/1.0")).toBe(false);
  });

  it("scopes the corpus paths to the expensive routes only", () => {
    for (const p of [
      "/carousel/template-example/a/b",
      "/hi/carousel/template-example/a/b",
      "/nano-template/x",
      "/zh/nano-banana-pro-prompts/3622",
    ]) expect(isCorpusPath(p), p).toBe(true);
    for (const p of ["/", "/blog/x", "/tools/mockup", "/zh/topics/merch", "/pricing"])
      expect(isCorpusPath(p), p).toBe(false);
  });
});
