import Link from 'next/link'
import Hero from '@/components/public/hero'
import ProductCard from '@/components/public/product-card'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import { getFeaturedProducts, getCategories, getSiteSettings } from '@/lib/queries'

export const revalidate = 3600 // ISR: revalidate every hour

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
    getSiteSettings(),
  ])

  return (
    <>
      {/* Hero Section */}
      <Hero 
        title={settings?.heroTitle || 'Premium Hot Wheels Collection'}
        subtitle={settings?.heroSubtitle || 'Authentic diecast collector cars for serious enthusiasts'}
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
              View All →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">
              No featured products available yet.
            </p>
          )}
        </div>
      </section>

      {/* Categories Preview */}
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

      {/* Trust Section */}
      <section className="py-16 bg-hotwheels-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">🏎️</div>
              <h3 className="text-xl font-bold text-hotwheels-white mb-2">Genuine Products</h3>
              <p className="text-gray-400">Authentic Hot Wheels diecast cars sourced directly</p>
            </div>
            <div>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-hotwheels-white mb-2">Collector Quality</h3>
              <p className="text-gray-400">Carefully preserved for serious collectors</p>
            </div>
            <div>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-hotwheels-white mb-2">Fast Replies</h3>
              <p className="text-gray-400">WhatsApp us for instant responses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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