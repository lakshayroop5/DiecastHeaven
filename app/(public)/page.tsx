import { Suspense } from 'react'
import Link from 'next/link'
import Hero from '@/components/public/hero'
import FeaturedProducts from '@/components/public/featured-products'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import { getCategories, getBrands, getSiteSettings, getHeroMedia } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black">
          <div className="aspect-square bg-hotwheels-black animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-hotwheels-black rounded w-1/3 animate-pulse" />
            <div className="h-5 bg-hotwheels-black rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-hotwheels-black rounded w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function HomePage() {
  const [categories, brands, settings, heroMedia] = await Promise.all([
    getCategories(),
    getBrands(),
    getSiteSettings(),
    getHeroMedia(),
  ])

  return (
    <>
      {/* Hero */}
      <Hero
        title={settings?.heroTitle || process.env.DEFAULT_HERO_TITLE || "India's Premium Diecast Destination"}
        subtitle={
          settings?.heroSubtitle ||
          process.env.DEFAULT_HERO_SUBTITLE ||
          'Hot Wheels \u00b7 Majorette \u00b7 Matchbox \u00b7 Bburago \u00b7 Tomica'
        }
        media={heroMedia}
      />

      {/* Featured Products */}
      <section className="py-16 bg-hotwheels-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-hotwheels-white">
              Featured Models
            </h2>
            <Link
              href="/catalog"
              className="text-sm font-medium text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
            >
              View All &rarr;
            </Link>
          </div>

          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-hotwheels-gray">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-hotwheels-white mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="group bg-hotwheels-black rounded-lg p-6 text-center hover:bg-hotwheels-red/20 transition-colors border border-hotwheels-black hover:border-hotwheels-red"
              >
                <h3 className="font-semibold text-hotwheels-white group-hover:text-hotwheels-yellow transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brand */}
      <section className="py-16 bg-hotwheels-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-hotwheels-white">
              Shop by Brand
            </h2>
            <Link
              href="/catalog?view=brands"
              className="text-sm font-medium text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/catalog?brand=${brand.slug}`}
                className="group bg-hotwheels-gray rounded-lg p-4 text-center hover:bg-hotwheels-red/20 transition-colors border border-hotwheels-gray hover:border-hotwheels-red"
              >
                <h3 className="font-semibold text-sm text-hotwheels-white group-hover:text-hotwheels-yellow transition-colors">
                  {brand.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-hotwheels-gray">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">&#x1F3CE;&#xFE0F;</div>
              <h3 className="text-xl font-bold text-hotwheels-white mb-2">Genuine Products</h3>
              <p className="text-gray-400">Authentic diecast cars sourced directly from brands</p>
            </div>
            <div>
              <div className="text-4xl mb-4">&#x26A1;</div>
              <h3 className="text-xl font-bold text-hotwheels-white mb-2">Collector Quality</h3>
              <p className="text-gray-400">Carefully preserved for serious collectors</p>
            </div>
            <div>
              <div className="text-4xl mb-4">&#x1F4AC;</div>
              <h3 className="text-xl font-bold text-hotwheels-white mb-2">Fast Replies</h3>
              <p className="text-gray-400">WhatsApp us for instant responses</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-hotwheels-red">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Next Gem?
          </h2>
          <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            Browse our complete collection or message us directly to find a specific model.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-hotwheels-red hover:bg-gray-100 transition-colors"
            >
              Browse Catalog
            </Link>
            <WhatsAppCTA variant="secondary" />
          </div>
        </div>
      </section>
    </>
  )
}
