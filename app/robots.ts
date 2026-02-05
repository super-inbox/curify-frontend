import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/'],
    },
    sitemap: 'https://www.curify-ai.com/sitemap.xml',
    host: 'https://www.curify-ai.com',
  }
}
