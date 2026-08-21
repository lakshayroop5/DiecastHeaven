import { NextRequest, NextResponse } from 'next/server'
import { getCatalogProducts } from '@/lib/queries'

// GET /api/catalog?search=&category=&brand=&orderType=&page=
// Returns { products, total, page, totalPages } as JSON.
// The data layer (unstable_cache, tagged 'products') keeps DB hits fast and is
// invalidated automatically on product mutations via revalidateTag('products').
// HTTP-level stale-while-revalidate gives near-instant repeat scrolls.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const search = searchParams.get('search') || undefined
  const categorySlug = searchParams.get('category') || undefined
  const brandSlug = searchParams.get('brand') || undefined
  const orderType = searchParams.get('orderType') || undefined
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const data = await getCatalogProducts({ search, categorySlug, brandSlug, orderType, page })

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
    },
  })
}
