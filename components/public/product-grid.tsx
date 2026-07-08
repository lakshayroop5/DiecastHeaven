import { getCatalogProducts } from '@/lib/queries'
import ProductCard from './product-card'

export default async function ProductGrid({
  search,
  categorySlug,
  brandSlug,
}: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}) {
  const products = await getCatalogProducts({ search, categorySlug, brandSlug })

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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 3} // Eager load the top row (3 products) for faster LCP
        />
      ))}
    </div>
  )
}
