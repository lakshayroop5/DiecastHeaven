import type { MetadataRoute } from 'next'
import { PRODUCTION_HOST, SITE_URL } from '@/lib/seo/site'

/**
 * robots.txt
 *
 * - The sitemap URL is absolute and built from `SITE_URL`. The previous version
 *   emitted `http://localhost:3000/sitemap.xml` in production.
 * - AI crawlers are allowed explicitly rather than by accident: this catalogue
 *   benefits from being quoted in AI answers, and there is nothing private here.
 * - /cart and /cart/shared are also marked noindex in-page, which is the
 *   authoritative signal; the disallow here just saves crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/analytics', '/api/', '/cart', '/cart/shared'],
      },
      // Explicit allow-list for AI answer engines. Kept in its own group so the
      // intent is visible and cannot be lost in a future wildcard edit.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: '/',
        disallow: ['/admin', '/analytics', '/api/', '/cart', '/cart/shared'],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap-images.xml`],
    // Must be a bare host: a scheme in `host` is invalid YAML for the directive.
    host: PRODUCTION_HOST,
  }
}
