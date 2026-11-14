import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from '@/lib/queries'
import { coreCatalogueUrls, submitToIndexNow } from '@/lib/seo/indexnow'

/**
 * Cache revalidation + search-engine ping.
 *
 * Body is optional: `{ "urls": ["/product/foo"] }` narrows the IndexNow ping to
 * the pages that actually changed. Without a body only the catalogue entry
 * points are announced. IndexNow failures never fail the request.
 */
export async function POST(request: Request) {
  revalidateTag('products')
  revalidateTag('featured-products')
  revalidateTag('categories')
  revalidateTag('brands')
  revalidateTag('settings')

  // `revalidateTag` clears the data cache, but product pages are prerendered
  // (ISR) so their HTML lives in the full route cache as well. Without this the
  // tag is stale yet the old HTML keeps being served until `revalidate` expires.
  revalidatePath('/', 'layout')

  let extraUrls: string[] = []
  try {
    const body = await request.json()
    if (Array.isArray(body?.urls)) {
      extraUrls = body.urls.filter((url: unknown): url is string => typeof url === 'string')
    }
  } catch {
    // No body - fine.
  }

  const indexNow = await submitToIndexNow([...coreCatalogueUrls(), ...extraUrls])

  return NextResponse.json({
    revalidated: true,
    indexNow,
    timestamp: Date.now(),
  })
}
