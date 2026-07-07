import { getRelatedProducts } from '@/lib/queries'
import ProductCard from './product-card'

// ponytail: streams via Suspense — page shell renders immediately
export default async function RelatedProducts({
  categoryIds,
  excludeProductId,
}: {
  categoryIds: string[]
  excludeProductId: string
}) {
  const relatedProducts = await getRelatedProducts(categoryIds, excludeProductId, 4)

  if (relatedProducts.length === 0) return null

  return (
    <div className="mt-10 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-bold text-hotwheels-white mb-4 sm:mb-6">
        Related Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {relatedProducts.map((rp) => (
          <ProductCard key={rp.id} product={rp} />
        ))}
      </div>
    </div>
  )
}
