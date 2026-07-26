import Link from 'next/link'
import { getCatalogProducts } from '@/lib/queries'
import ProductCard from './product-card'

export default async function ProductGrid({
  search,
  categorySlug,
  brandSlug,
  orderType,
  page = 1,
}: {
  search?: string
  categorySlug?: string
  brandSlug?: string
  orderType?: string
  page?: number
}) {
  const { products, total, totalPages } = await getCatalogProducts({ search, categorySlug, brandSlug, orderType, page })

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

  const baseParams = new URLSearchParams()
  if (search) baseParams.set('search', search)
  if (categorySlug) baseParams.set('category', categorySlug)
  if (brandSlug) baseParams.set('brand', brandSlug)
  if (orderType) baseParams.set('orderType', orderType)
  const base = baseParams.toString() ? `?${baseParams}&` : '?'

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={page === 1 && index < 3}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          {page > 1 ? (
            <Link href={`${base}page=${page - 1}`} className="px-5 py-2.5 rounded-full bg-hotwheels-gray text-gray-300 text-sm font-medium hover:bg-hotwheels-black hover:text-hotwheels-white transition-colors border border-hotwheels-gray hover:border-hotwheels-red">
              &larr; Prev
            </Link>
          ) : (
            <span className="px-5 py-2.5 rounded-full bg-hotwheels-gray/50 text-gray-600 text-sm font-medium border border-hotwheels-gray/50 cursor-not-allowed">
              &larr; Prev
            </span>
          )}
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages} ({total} products)
          </span>
          {page < totalPages ? (
            <Link href={`${base}page=${page + 1}`} className="px-5 py-2.5 rounded-full bg-hotwheels-gray text-gray-300 text-sm font-medium hover:bg-hotwheels-black hover:text-hotwheels-white transition-colors border border-hotwheels-gray hover:border-hotwheels-red">
              Next &rarr;
            </Link>
          ) : (
            <span className="px-5 py-2.5 rounded-full bg-hotwheels-gray/50 text-gray-600 text-sm font-medium border border-hotwheels-gray/50 cursor-not-allowed">
              Next &rarr;
            </span>
          )}
        </div>
      )}
    </div>
  )
}
