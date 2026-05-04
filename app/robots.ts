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
        // Amazonbot is low SEO value (used for Alexa/Amazon shopping
        // integrations). The two crawl-heavy surfaces below back into
        // the Azure prompts/templates API on each render, so disallow
        // them across every locale via a wildcard.
        userAgent: 'Amazonbot',
        disallow: [
          '/*/nano-banana-pro-prompts/',
          '/*/nano-template/',
        ],
      },
    ],
    sitemap: 'https://www.curify-ai.com/sitemap.xml',
    host: 'https://www.curify-ai.com',
  }
}
