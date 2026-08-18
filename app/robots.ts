import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

/** The only host that should ever appear in a search index. Local const, not
 *  exported: Next validates the export shape of metadata route files. */
const CANONICAL_HOST = 'www.curify-ai.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 2026-08-17: the Vercel deployment host serves a byte-identical copy of
  // the site with `Allow: /`, and Google found it — URL Inspection reports
  // https://curify-frontend.vercel.app/... as the *referring URL* that
  // discovered /zh/tools/mockup, /zh/tools/packaging-mockup and the en
  // mockup-set template page. Pages there do emit a cross-domain canonical
  // back to www, so index signal isn't split, but every crawl of that host
  // is a full dynamic render (the (public) layout calls headers()) billed as
  // Fast Origin Transfer — the same cost line that drove the 06-23 bot
  // blocklist. Serve a closed robots.txt on any non-canonical host.
  //
  // Host-based, NOT VERCEL_ENV-based: the *.vercel.app alias of a production
  // deployment reports VERCEL_ENV=production, so an env check would silently
  // never fire. Pairs with the x-robots-tag noindex set in middleware.ts,
  // which covers URLs Google already knows before this propagates.
  const host = (await headers()).get('host') ?? ''
  if (host && host !== CANONICAL_HOST && host !== 'curify-ai.com') {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /search is dynamic per-query (q param), Cache: MISS on every
        // crawl, and produces a Node function execution. Already noindex
        // via app/[locale]/(public)/search/page.tsx metadata, but bots
        // need the robots.txt signal to skip the fetch entirely.
        disallow: ['/api/', '/auth/', '/public/data/', '/search', '/*/search'],
      },
      {
        // These crawlers consume Vercel Fast Data Transfer with little
        // SEO upside. The two routes below back into the Azure prompts /
        // templates API and the static-but-heavy template JSON on each
        // render, so disallow them across every locale via a wildcard.
        //
        // Kept allowed: Googlebot, Bingbot, DuckDuckBot, AhrefsBot,
        // SEMrushBot (the last two are SEO-research crawlers we still
        // want signal from).
        //
        // 2026-06-23 expansion: added 11 more bots (CCBot through
        // TelegramBot) after crossing the 1 TB Vercel Fast Data Transfer
        // free tier on 6/14 and incurring $0.15/GB overage. None of
        // these drive measurable Curify SEO traffic — they're AI
        // training corpora (CCBot, cohere-ai, anthropic-ai, Meta-External*,
        // ImagesiftBot, Diffbot), heavy SEO crawlers we don't use
        // (MJ12bot, DataForSeoBot, DotBot), news scrapers (omgilibot),
        // and a link-preview bot (TelegramBot) that hits hot when shared.
        //
        // 2026-08-09 correction — TRAINING vs RETRIEVAL. The 06-23 list
        // treated both as one category. They are not:
        //   * TRAINING corpora (GPTBot, CCBot, cohere-ai, anthropic-ai,
        //     Meta-External*, ImagesiftBot, Diffbot) ingest in bulk and
        //     never attribute. No citation is possible. Still blocked.
        //   * RETRIEVAL/CITATION fetchers (ChatGPT-User, PerplexityBot)
        //     fetch on demand when a user asks and cite the source with a
        //     link. That is the GEO surface, and it is low volume by
        //     nature — an on-demand fetch, not a bulk crawl.
        // AI referrals are our best-converting traffic by a wide margin
        // (90d: chatgpt.com 79 visitors/70 actions, gemini 57/61, doubao
        // 15/43, perplexity 12/15 — versus m.facebook.com's 1,557
        // visitors at ~0 actions), so blocking the fetchers that feed it
        // cost far more than the transfer it saved. ChatGPT-User and
        // PerplexityBot are therefore removed from this list; OAI-SearchBot
        // was never on it. See docs/workstream-seo-smm-growth.md.
        //
        // The cost rationale also did not hold: /carousel/* is not listed
        // below, so the blocked crawlers simply moved there —
        // meta-externalagent put 18,484 of its 18,572 90-day events on
        // /carousel/template-example/* and zero on /nano-template/. Same
        // content, different URL shape.
        userAgent: [
          // Original blocklist (2026-05)
          'Amazonbot',
          'VelenPublicWebCrawler',
          'Bytespider',
          'GPTBot',               // OpenAI TRAINING crawler (not search)
          'ClaudeBot',
          'Claude-Web',
          // 2026-06-23 cost-reduction expansion
          'CCBot',                // Common Crawl
          'MJ12bot',              // Majestic SEO heavy crawler
          'DataForSeoBot',
          'DotBot',               // OpenSiteExplorer / Moz
          'Meta-ExternalAgent',   // Meta AI training fetcher
          'Meta-ExternalFetcher',
          'cohere-ai',            // Cohere training fetcher
          'anthropic-ai',         // Anthropic sibling to ClaudeBot
          'omgilibot',            // Webhose / news scraper
          'omgili',               // omgilibot variant
          'ImagesiftBot',         // Image AI training corpus
          'Diffbot',              // Structured-data scraper
          'TelegramBot',          // Link preview crawler
        ],
        disallow: [
          '/*/nano-banana-pro-prompts/',
          '/*/nano-template/',
        ],
      },
    ],
    sitemap: 'https://www.curify-ai.com/sitemap-index.xml',
    host: 'https://www.curify-ai.com',
  }
}
