import { Suspense } from 'react'
import { getFeaturedProductSlugs } from '@/lib/queries'
import ProductCardServer from './product-card-server'
import CardSkeleton from './card-skeleton'

// ponytail: fetch slugs only, each card streams independently via Suspense
export default async function FeaturedProducts() {
  const products = await getFeaturedProductSlugs(6)

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        No featured products available yet.
      </p>
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
