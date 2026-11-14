import Link from 'next/link'
import ProductCard from './product-card'
import type { ProductWithRelations } from '@/lib/types'

interface ProductCollectionProps {
  products: ProductWithRelations[]
  /** Renders a link back into the paginated catalogue when the list is capped. */
  moreHref?: string
  moreLabel?: string
}

/**
 * Server-rendered product grid for landing pages.
 *
 * Deliberately not `ProductGrid`: that component is a client-side infinite
 * scroller, and landing pages need the product links to exist in the initial
 * HTML so crawlers can follow them.
 */
export default function ProductCollection({ products, moreHref, moreLabel }: ProductCollectionProps) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-gray-400">
        No products in this collection right now. Check back soon for new arrivals.
      </p>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 3} />
        ))}
      </div>

      {moreHref && (
        <div className="mt-10 text-center">
          <Link
            href={moreHref}
            className="inline-block rounded-md border border-hotwheels-gray px-6 py-3 text-sm font-semibold text-hotwheels-white hover:border-hotwheels-red/60 transition-colors"
          >
            {moreLabel ?? 'View all in catalog'}
          </Link>
        </div>
      )}
    </div>
  )
}
