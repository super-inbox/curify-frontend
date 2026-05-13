import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/public/data/'],
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
