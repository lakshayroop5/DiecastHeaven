import { Suspense } from 'react'
import { getCatalogProductSlugs } from '@/lib/queries'
import ProductCardServer from './product-card-server'

// ponytail: skeleton placeholder while card streams in
function CardSkeleton() {
  return (
    <div className="bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black">
      <div className="aspect-square bg-hotwheels-black animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-hotwheels-black rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-hotwheels-black rounded w-2/3 animate-pulse" />
        <div className="flex gap-1">
          <div className="h-5 bg-hotwheels-black rounded-full w-16 animate-pulse" />
          <div className="h-5 bg-hotwheels-black rounded-full w-12 animate-pulse" />
        </div>
        <div className="h-4 bg-hotwheels-black rounded w-1/4 animate-pulse" />
        <div className="h-6 bg-hotwheels-black rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-hotwheels-black rounded w-full animate-pulse" />
        <div className="h-4 bg-hotwheels-black rounded w-4/5 animate-pulse" />
        <div className="h-9 bg-hotwheels-black rounded w-full animate-pulse" />
      </div>
    </div>
  )
}

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
