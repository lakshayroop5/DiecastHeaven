import Link from 'next/link'
import type { Metadata } from 'next'
import { getBrands, getPublishedProducts } from '@/lib/queries'
import JsonLd from '@/components/seo/json-ld'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { SITE_NAME, SITE_URL, truncate } from '@/lib/seo/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Diecast Car Brands — Hot Wheels, Majorette, Tomica & More',
  description: truncate(
    `Browse every diecast brand we stock at ${SITE_NAME}: Hot Wheels, Hot Wheels Premium, Hot Wheels Silver Series, Majorette, Matchbox, Bburago, Tomica, Tarmac Works and Pop Race. Genuine collector cars shipping across India.`,
    158
  ),
  alternates: { canonical: '/brands' },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/brands`,
    siteName: SITE_NAME,
    title: 'Diecast Car Brands — Hot Wheels, Majorette, Tomica & More',
    description: `Every diecast brand stocked at ${SITE_NAME}, shipping across India.`,
  },
}

export default async function BrandsIndexPage() {
  const [brands, products] = await Promise.all([getBrands(), getPublishedProducts()])

  const countByBrand = products.reduce<Record<string, number>>((acc, product) => {
    if (product.brand?.slug) acc[product.brand.slug] = (acc[product.brand.slug] ?? 0) + 1
    return acc
  }, {})

  const visibleBrands = brands.filter((brand) => (countByBrand[brand.slug] ?? 0) > 0)

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Brands', path: '/brands' },
        ])}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-gray-400">
          <Link href="/" className="hover:text-hotwheels-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-hotwheels-white">Brands</span>
        </nav>

        <h1 className="text-3xl font-bold text-hotwheels-white mb-3">Shop by Brand</h1>
        <p className="text-gray-400 max-w-3xl mb-10">
          Every diecast brand we currently stock. Each brand page lists what is in stock right
          now, with prices in INR and WhatsApp ordering.
        </p>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleBrands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex h-full flex-col justify-between rounded-lg border border-[#2D2D2D] bg-[#1A1A1A] p-5 hover:border-hotwheels-red/60 transition-colors"
              >
                <span className="font-semibold text-hotwheels-white group-hover:text-hotwheels-yellow transition-colors">
                  {brand.name}
                </span>
                <span className="mt-2 text-xs text-gray-400">
                  {countByBrand[brand.slug] ?? 0} {(countByBrand[brand.slug] ?? 0) === 1 ? 'model' : 'models'}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {visibleBrands.length === 0 && (
          <p className="text-gray-400">No brands are listed right now.</p>
        )}
      </div>
    </div>
  )
}
