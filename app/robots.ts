import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
        userAgent: [
          // Original blocklist (2026-05)
          'Amazonbot',
          'VelenPublicWebCrawler',
          'Bytespider',
          'GPTBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          // 2026-06-23 cost-reduction expansion
          'CCBot',                // Common Crawl
          'MJ12bot',              // Majestic SEO heavy crawler
          'DataForSeoBot',
          'DotBot',               // OpenSiteExplorer / Moz
          'Meta-ExternalAgent',   // Meta AI training fetcher
          'Meta-ExternalFetcher',
          'ChatGPT-User',         // OpenAI on-demand (separate from GPTBot)
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
