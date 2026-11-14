import { getPublishedProducts } from '@/lib/queries'
import { buildMerchantFeed } from '@/lib/seo/merchant-feed'

/**
 * Google Merchant Center scheduled-fetch endpoint.
 *
 * Register this URL in Merchant Center as a scheduled fetch:
 *   https://www.diecastheavenudaipur.in/feed/google-merchant.xml
 *
 * Served as RSS 2.0 with the `g:` namespace, which Merchant Center accepts
 * directly. Cached for an hour at the edge; product edits also invalidate it via
 * the `products` cache tag used by `lib/queries.ts`.
 */
export const revalidate = 3600

export async function GET() {
  const products = await getPublishedProducts()
  const { xml, included, skipped } = buildMerchantFeed(products)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Feed-Items': String(included),
      'X-Feed-Skipped': String(skipped),
    },
  })
}
