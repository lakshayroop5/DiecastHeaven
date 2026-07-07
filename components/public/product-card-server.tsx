import { getProductBySlug } from '@/lib/queries'
import ProductCard from './product-card'

// ponytail: async server component — fetches one product, streams via parent Suspense
export default async function ProductCardServer({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug)
  if (!product) return null
  return <ProductCard product={product} />
}
