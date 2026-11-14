import type { Metadata } from 'next'
import { getCategories, getBrands, getCatalogProducts } from '@/lib/queries'
import ProductGrid from '@/components/public/product-grid'
import CatalogFilters from '@/components/public/catalog-filters'
import CatalogEventTracker from '@/components/analytics/catalog-event-tracker'
import JsonLd from '@/components/seo/json-ld'
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema'
import { SITE_NAME, SITE_URL, absoluteUrl, truncate } from '@/lib/seo/site'

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    search?: string
    view?: string
    orderType?: string
  }>
}

type CatalogParams = Awaited<CatalogPageProps['searchParams']>

/**
 * Canonicalisation policy for a filtered catalogue.
 *
 * Every filter combination used to render the identical `<title>Diecast Heaven`
 * with no canonical, and Google indexed several of them. Now:
 * - brand / category / brand-index filters canonicalise onto their real landing
 *   pages, so link equity consolidates there instead of on a query string.
 * - internal search results are `noindex` (they are infinite duplicates).
 * - the plain catalogue is indexable and self-canonical.
 */
function canonicalFor(params: CatalogParams): { canonical: string; noindex: boolean } {
  const { search, brand, category, view } = params

  if (search) return { canonical: '/catalog', noindex: true }
  if (view === 'brands') return { canonical: '/brands', noindex: false }
  if (brand) return { canonical: `/brands/${brand}`, noindex: false }
  if (category) return { canonical: `/categories/${category}`, noindex: false }
  return { canonical: '/catalog', noindex: false }
}

/** Turns `hotwheels-premium` into `Hotwheels Premium` for headings and titles. */
function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function catalogHeading(params: CatalogParams): string {
  const { search, brand, category, view, orderType } = params
  if (search) return `Search: "${search}"`
  if (brand) return `${humanizeSlug(brand)} diecast cars`
  if (category) return `${humanizeSlug(category)} diecast cars`
  if (view === 'brands') return 'Shop by Brand'
  if (orderType === 'PRE_ORDER') return 'Pre-order diecast cars'
  return 'Diecast Cars Catalog'
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams
  const { canonical, noindex } = canonicalFor(params)
  const heading = catalogHeading(params)

  const description = truncate(
    `Browse ${SITE_NAME}'s diecast collector cars — Hot Wheels, Hot Wheels Premium, Majorette, Matchbox, Bburago, Tomica, Tarmac Works and Pop Race. Prices in INR, genuine models, shipping across India.`,
    158
  )

  return {
    title: { absolute: `${heading} | ${SITE_NAME}` },
    description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      title: `${heading} | ${SITE_NAME}`,
      description,
    },
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const { category, brand, search, view, orderType } = params

  const [categories, brands, initial] = await Promise.all([
    getCategories(),
    getBrands(),
    getCatalogProducts({ search, categorySlug: category, brandSlug: brand, orderType, page: 1 }),
  ])

  const showBrandView = view === 'brands'

  const activeFilterCount =
    (orderType ? 1 : 0) + (category ? 1 : 0) + (brand ? 1 : 0)

  // Remount the grid when filters change so it resets to a fresh page 1.
  const gridKey = [search, category, brand, orderType, view].filter(Boolean).join('|') || 'all'

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Catalog', path: '/catalog' },
          ]),
          itemListSchema(initial.products, {
            url: absoluteUrl('/catalog'),
            name: 'Diecast cars catalog',
          }),
        ]}
      />
      <CatalogEventTracker search={search} category={category} brand={brand} orderType={orderType} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hotwheels-white mb-4">
            {catalogHeading(params)}
          </h1>
          <CatalogFilters
            categories={categories}
            brands={brands}
            showBrandView={showBrandView}
            activeCount={activeFilterCount}
          />
          {search && (
            <p className="mt-4 text-sm text-gray-400">
              Searching for &quot;{search}&quot;...
            </p>
          )}
        </div>

        <ProductGrid
          key={gridKey}
          initialProducts={initial.products}
          initialPage={1}
          total={initial.total}
          totalPages={initial.totalPages}
          search={search}
          categorySlug={category}
          brandSlug={brand}
          orderType={orderType}
        />
      </div>
    </div>
  )
}
