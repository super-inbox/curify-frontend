// Edge-level UA blocklist for bulk training crawlers on the heavy corpus
// routes. Companion to lib/blocked-networks.ts (IP-based).
//
// 2026-08-19 SPIKE. Vercel logs show meta-externalagent walking
// /hi/carousel/template-example/... with 40-id `ids=` query strings, at
// ~276 MB memory / ~531 MB Fluid / 90-260 ms per invocation. Every hit is a
// full dynamic render: the (public) layout calls headers(), so nothing is
// served from cache.
//
// WHY robots.txt WAS NOT ENOUGH — two independent holes, both now closed:
//
//  1. /carousel/* was never in the disallow list. app/robots.ts has carried a
//     comment since 2026-08-09 recording that meta-externalagent put 18,484 of
//     its 18,572 90-day events on /carousel/template-example/* and zero on
//     /nano-template/ — i.e. the blocked crawlers simply moved to the same
//     content under a different URL shape. The observation was written down;
//     the path was never actually added. It is added now.
//  2. robots.txt is advisory and re-read on the crawler's own schedule, so a
//     disallow does not stop today's bleed. This list is the enforcement layer.
//
// UA MATCHING IS SAFE HERE, unlike the Alibaba case in blocked-networks.ts.
// That pool had to be blocked on IP because its UA was the stock Mac Chrome
// string that 2,681 real visitors also send. Every token below is a
// self-declared bot name with no human collision.
//
// BYTESPIDER IS DELIBERATELY NOT ENFORCED HERE, though it stays in the
// robots.txt list. Bytespider is ByteDance's crawler and Doubao is ByteDance's
// assistant — and app/robots.ts records doubao at 15 visitors / 43 actions over
// 90 days, the highest action-per-visitor ratio of any AI referrer we have.
// Robots.txt has disallowed Bytespider since 2026-05 and the Doubao referrals
// exist anyway, which means something ByteDance-side is fetching regardless of
// the advisory rule. A 403 would be the first mechanism that actually stops it,
// so enforcing here risks killing a converting channel to save transfer — the
// exact trade the 08-09 training-vs-retrieval note warns about. Revisit only
// with referral data showing Doubao has gone to zero anyway.
//
// DELIBERATELY ABSENT — the retrieval/citation fetchers. ChatGPT-User,
// OAI-SearchBot and PerplexityBot fetch on demand when a user asks and cite
// the source with a link. AI referrals are our best-converting traffic by a
// wide margin, so blocking them costs far more than the transfer it saves.
// See the training-vs-retrieval note in app/robots.ts.
export const BLOCKED_BOT_UAS: ReadonlyArray<string> = [
  "meta-externalagent",
  "meta-externalfetcher",
  "gptbot",
  "ccbot",
  "cohere-ai",
  "anthropic-ai",
  "claudebot",
  "claude-web",
  "amazonbot",
  "imagesiftbot",
  "diffbot",
  "omgilibot",
  "omgili",
  "mj12bot",
  "dataforseobot",
  "dotbot",
  "velenpubliccrawler",
  "velenpublicwebcrawler",
];

/** Corpus routes that cost a full dynamic render. Matched on the path with the
 *  locale segment optional, e.g. /hi/carousel/... and /carousel/... both hit. */
const CORPUS_PATH_RE =
  /^\/(?:[a-z]{2}(?:-[A-Za-z]{2})?\/)?(?:carousel|nano-template|nano-banana-pro-prompts)(?:\/|$)/;

export function isCorpusPath(pathname: string): boolean {
  return CORPUS_PATH_RE.test(pathname);
}

export function isBlockedBot(ua: string | null | undefined): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BLOCKED_BOT_UAS.some((t) => lower.includes(t));
}
