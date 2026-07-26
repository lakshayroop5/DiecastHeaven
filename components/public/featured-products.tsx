import { getFeaturedProducts } from '@/lib/queries'
import FeaturedScroll from './featured-scroll'

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        No featured products available yet.
      </p>
    )
  }

  return <FeaturedScroll products={products} />
}
