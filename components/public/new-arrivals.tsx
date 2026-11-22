import { getNewArrivals } from '@/lib/queries'
import ProductCarouselSection from './product-carousel-section'

/**
 * Built-in homepage section, on by default like Featured Models.
 *
 * Driven by `createdAt` instead of a per-product flag, so adding stock is the
 * only action needed to keep it current.
 */
export default async function NewArrivals() {
  const products = await getNewArrivals()

  if (products.length === 0) return null

  return <ProductCarouselSection title="New Arrivals" products={products} />
}
