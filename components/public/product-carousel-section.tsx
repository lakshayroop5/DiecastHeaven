import Link from 'next/link'
import FeaturedScroll from './featured-scroll'
import type { ProductWithRelations } from '@/lib/types'

/**
 * One homepage product carousel.
 *
 * Shared by the built-in sections (Featured Models, New Arrivals) and by the
 * admin-defined ones (`ProductScrollList`). Only the title and the products are
 * inputs, so a section can never drift in styling from its siblings.
 *
 * Callers must pass a non-empty `products`; empty sections are dropped before
 * they reach the page.
 */
export default function ProductCarouselSection({
  title,
  products,
  href = '/catalog',
}: {
  title: string
  products: ProductWithRelations[]
  href?: string
}) {
  return (
    <section className="py-16 bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-hotwheels-white">{title}</h2>
          <Link
            href={href}
            className="text-sm font-medium text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <FeaturedScroll products={products} />
      </div>
    </section>
  )
}
