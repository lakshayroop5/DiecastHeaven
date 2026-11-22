import { getFeaturedProducts } from '@/lib/queries'
import ProductCarouselSection from './product-carousel-section'

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return <ProductCarouselSection title="Featured Models" products={products} />
}
