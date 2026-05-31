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
        userAgent: [
          'Amazonbot',
          'VelenPublicWebCrawler',
          'Bytespider',
          'GPTBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
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
