import { Suspense } from 'react'
import { getCatalogProductSlugs } from '@/lib/queries'
import ProductCardServer from './product-card-server'
import CardSkeleton from './card-skeleton'

// ponytail: fetch slugs only, each card streams independently via Suspense
export default async function ProductGrid({
  search,
  categorySlug,
  brandSlug,
}: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}) {
  const products = await getCatalogProductSlugs({ search, categorySlug, brandSlug })

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">
          {search ? `No products match "${search}"` : 'No products available'}
        </p>
        {!search && <p className="text-gray-500 text-sm mt-2">Check back soon for new arrivals!</p>}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <Suspense key={p.slug} fallback={<CardSkeleton />}>
          <ProductCardServer slug={p.slug} />
        </Suspense>
      ))}
    </div>
  )
}
