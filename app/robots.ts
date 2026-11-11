import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.diecastheavenudaipur.in'
  
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/analytics', '/api/', '/cart'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}