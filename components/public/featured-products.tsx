import { getFeaturedProducts } from '@/lib/queries'
import ProductCard from './product-card'

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts(6)

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        No featured products available yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
