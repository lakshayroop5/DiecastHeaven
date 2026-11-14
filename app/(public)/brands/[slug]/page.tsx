import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBrands, getPublishedProducts } from '@/lib/queries'
import JsonLd from '@/components/seo/json-ld'
import ProductCollection from '@/components/public/product-collection'
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema'
import { SITE_LOCALE, SITE_NAME, SITE_URL, absoluteUrl, defaultOgImage, truncate } from '@/lib/seo/site'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

/** Caps the server-rendered grid so brand pages stay light; the rest link to /catalog. */
const MAX_RENDERED = 36

export const revalidate = 1800

export async function generateStaticParams() {
  const brands = await getBrands()
  return brands.map((brand) => ({ slug: brand.slug }))
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const brands = await getBrands()
  const brand = brands.find((item) => item.slug === slug)

  if (!brand) {
    return { title: 'Brand not found', robots: { index: false, follow: true } }
  }

  const products = await getPublishedProducts()
  const count = products.filter((product) => product.brand?.slug === slug).length

  const title = `${brand.name} Diecast Cars — Buy Online in India`
  const description = truncate(
    `Shop ${brand.name} diecast collector cars at ${SITE_NAME}. ${count} ${
      count === 1 ? 'model' : 'models'
    } available now with prices in INR, genuine and collector-grade, shipping across India. Order on WhatsApp.`,
    158
  )

  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
    // No stock means no reason for this page to be in the index.
    ...(count === 0
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/brands/${brand.slug}`,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      locale: SITE_LOCALE,
      images: [defaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [defaultOgImage().url],
    },
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params
  const [brands, products] = await Promise.all([getBrands(), getPublishedProducts()])

  const brand = brands.find((item) => item.slug === slug)
  if (!brand) notFound()

  const brandProducts = products.filter((product) => product.brand?.slug === slug)
  const visible = brandProducts.slice(0, MAX_RENDERED)
  const hasMore = brandProducts.length > visible.length

  const categoriesInBrand = Array.from(
    new Set(brandProducts.flatMap((product) => product.categories.map(({ category }) => category.name)))
  )

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Brands', path: '/brands' },
            { name: brand.name, path: `/brands/${brand.slug}` },
          ]),
          itemListSchema(visible, {
            url: absoluteUrl(`/brands/${brand.slug}`),
            name: `${brand.name} diecast cars`,
          }),
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-gray-400">
          <Link href="/" className="hover:text-hotwheels-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/brands" className="hover:text-hotwheels-white transition-colors">Brands</Link>
          <span className="mx-2">/</span>
          <span className="text-hotwheels-white">{brand.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-hotwheels-white mb-3">
          {brand.name} Diecast Cars
        </h1>
        <p className="text-gray-400 max-w-3xl mb-2">
          {brandProducts.length} {brandProducts.length === 1 ? 'model' : 'models'} of {brand.name}{' '}
          in stock at {SITE_NAME}. Genuine collector cars, prices in INR, shipping across India.
        </p>
        {categoriesInBrand.length > 0 && (
          <p className="text-sm text-gray-500 mb-10">
            Categories: {categoriesInBrand.join(' · ')}
          </p>
        )}

        <ProductCollection
          products={visible}
          moreHref={hasMore ? `/catalog?brand=${brand.slug}` : undefined}
          moreLabel={`View all ${brandProducts.length} ${brand.name} models`}
        />
      </div>
    </div>
  )
}
